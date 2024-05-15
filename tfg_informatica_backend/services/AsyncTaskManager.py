import asyncio
import time
import logging

import netifaces
from ipaddress import ip_network
from napalm import get_network_driver
from sqlalchemy.exc import SQLAlchemyError

from app import app, db
from models.Device import Device
from models.DeviceStatus import DeviceStatus
from models.DeviceArpEntry import DeviceArpEntry
from models.DeviceInterface import DeviceInterface
from models.Host import Host
from services.DeviceManager import get_all_devices
import scapy.all as s
from datetime import datetime


class AsyncTaskManager:
    MAX_RECORDS_PER_DEVICE = 5

    def __init__(self):
        pass

    async def monitor_devices(self, device_monitor_interval: int):
        while True:
            devices = get_all_devices()

            for device in devices:
                self.process_device(device)

            print(f"Completed monitoring cycle for {len(devices)} devices.")
            await asyncio.sleep(device_monitor_interval)

    def process_device(self, device: Device):
        start_time = time.time()
        try:
            driver = get_network_driver(device.os)
            with driver(device.ip_address, device.username, device.password) as device_conn:
                facts = device_conn.get_facts()
                environment = device_conn.get_environment()
                arp_table = device_conn.get_arp_table()
                interfaces = device_conn.get_interfaces_counters()

                used_cpu = round(
                    sum(cpu_info["%usage"] for cpu_info in environment['cpu'].values()) / len(environment['cpu']), 2)
                used_ram = environment['memory']['used_ram']
                total_ram = environment['memory']['available_ram']
                used_ram_mb = round(used_ram / (1024 ** 2), 2)
                used_ram_percentage = round((used_ram / total_ram) * 100, 2)

                end_time = time.time()
                response_time = round(end_time - start_time, 2)

                self.update_device_status(device, facts, used_cpu, used_ram_mb, used_ram_percentage,
                                          response_time, arp_table, interfaces)
                self.delete_oldest_status(device.id)

        except Exception as e:
            print(f"Failed to connect or retrieve data for {device.ip_address}: {e}")
            self.update_device_status_failure(device.id)

    def update_device_status(self, device: Device, facts: dict, used_cpu: float, used_ram_mb: float,
                             used_ram_percentage: float, response_time: float, arp_table: list = None,
                             interfaces: dict = None):
        try:
            with app.app_context():
                device_db = Device.query.filter_by(id=device.id).first()
                device_db.current_status = True

                device_db.fqdn = facts['fqdn']
                device_db.hostname = facts['hostname']
                device_db.model = facts['model']
                device_db.os_version = facts['os_version']
                device_db.serial = facts['serial_number']
                device_db.vendor = facts['vendor']
                device_db.uptime = facts['uptime']

                device_db.cpu = used_cpu
                device_db.memory = used_ram_mb
                device_db.response_time = response_time
                device_db.memory_percentage = used_ram_percentage
                device_db.last_checked = datetime.now()
                db.session.commit()

                self.update_device_status_table(device_db.id, True, used_cpu, used_ram_percentage, response_time)

                if arp_table:
                    self.update_arp_table(device_db.id, arp_table)

                if interfaces:
                    self.update_interfaces_table(device_db.id, interfaces)

        except SQLAlchemyError as e:
            print(f"Database error: {e}")

    def update_device_status_table(self, device_id: int, status: bool, cpu: float, memory: float, response_time: float):
        try:
            with app.app_context():
                device_status_db = DeviceStatus(
                    device_id=device_id,
                    timestamp=datetime.now(),
                    status=status,
                    cpu=cpu,
                    memory=memory,
                    response_time=response_time)

                db.session.add(device_status_db)
                db.session.commit()
        except SQLAlchemyError as e:
            print(f"Database error: {e}")

    def update_arp_table(self, device_id: int, arp_table: list):
        try:
            with app.app_context():
                DeviceArpEntry.query.filter_by(device_id=device_id).delete()

                for entry in arp_table:
                    arp_entry = DeviceArpEntry(
                        device_id=device_id,
                        ip_address=entry['ip'],
                        mac_address=entry['mac'],
                        interface=entry.get('interface', '')
                    )
                    db.session.add(arp_entry)
                db.session.commit()
        except SQLAlchemyError as e:
            print(f"Database error when updating ARP table: {e}")

    def update_interfaces_table(self, device_id: int, interfaces: dict):
        try:
            with app.app_context():
                DeviceInterface.query.filter_by(device_id=device_id).delete()

                for interface, counters in interfaces.items():
                    interface_entry = DeviceInterface(
                        device_id=device_id,
                        interface_name=interface,
                        tx_errors=counters['tx_errors'],
                        rx_errors=counters['rx_errors'],
                        tx_discards=counters['tx_discards'],
                        rx_discards=counters['rx_discards'],
                        tx_unicast_packets=counters['tx_unicast_packets'],
                        rx_unicast_packets=counters['rx_unicast_packets'],
                    )
                    db.session.add(interface_entry)
                db.session.commit()
        except SQLAlchemyError as e:
            print(f"Database error when updating interfaces table: {e}")

    def update_device_status_failure(self, device_id: int):
        try:
            with app.app_context():
                device_db = Device.query.filter_by(id=device_id).first()
                device_db.current_status = False
                device_db.response_time = 0
                db.session.commit()
        except SQLAlchemyError as e:
            print(f"Database error: {e}")

    def delete_oldest_status(self, device_id: int):
        try:
            with app.app_context():
                count = DeviceStatus.query.filter_by(device_id=device_id).count()
                if count > self.MAX_RECORDS_PER_DEVICE:
                    excess = count - self.MAX_RECORDS_PER_DEVICE
                    oldest_records = DeviceStatus.query.filter_by(device_id=device_id).order_by(
                        DeviceStatus.timestamp.asc()).limit(excess)

                    for record in oldest_records:
                        db.session.delete(record)
                    db.session.commit()
        except SQLAlchemyError as e:
            print(f"Database error: {e}")

    async def monitor_hosts(self, host_monitor_interval: int):
        while True:
            hosts = self.process_hosts()
            self.update_hosts(hosts)
            print(f"Completed monitoring cycle for hosts.")
            await asyncio.sleep(host_monitor_interval)

    def process_hosts(self):
        try:
            gateways = netifaces.gateways()
            default_gateway = gateways['default'][netifaces.AF_INET][1]

            addrs = netifaces.ifaddresses(default_gateway)
            ip_info = addrs[netifaces.AF_INET][0]
            ip_address = ip_info['addr']
            netmask = ip_info['netmask']

            network = ip_network(f"{ip_address}/{netmask}", strict=False)

            ans, _ = s.arping(str(network))

            hosts = []
            for _, received in ans:
                ip_address = received.psrc
                mac_address = received.hwsrc
                hostname = "Unknown"

                host = Host(name=hostname, ip_address=ip_address, mac_address=mac_address)
                hosts.append(host)

            return hosts
        except Exception as e:
            print(f"Failed to process hosts: {e}")
            return []

    def update_hosts(self, hosts):
        try:
            with app.app_context():
                db.session.query(Host).delete()
                for host in hosts:
                    db.session.add(host)
                db.session.commit()
        except Exception as e:
            print(f"Failed to update hosts: {e}")
