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
from models.DeviceBgpNeighbor import DeviceBgpNeighbor
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
                config = device_conn.get_config()
                arp_table = device_conn.get_arp_table()
                interfaces = device_conn.get_interfaces()
                interfaces_counters = device_conn.get_interfaces_counters()
                bgp_neighbors = {
                    "global": {
                        "router_id": "10.0.1.1",
                        "peers": {
                            "10.0.0.2": {
                                "local_as": 65000,
                                "remote_as": 65000,
                                "remote_id": "10.0.1.2",
                                "is_up": True,
                                "is_enabled": True,
                                "description": "internal-2",
                                "uptime": 4838400,
                                "address_family": {
                                    "ipv4": {
                                        "sent_prefixes": 637213,
                                        "accepted_prefixes": 3142,
                                        "received_prefixes": 3142
                                    },
                                    "ipv6": {
                                        "sent_prefixes": 36714,
                                        "accepted_prefixes": 148,
                                        "received_prefixes": 148
                                    }
                                }
                            }
                        }
                    }
                }
                device_conn.close()

                used_cpu = round(
                    sum(cpu_info["%usage"] for cpu_info in environment['cpu'].values()) / len(environment['cpu']), 2)
                used_ram = environment['memory']['used_ram']
                total_ram = environment['memory']['available_ram']
                used_ram_mb = round(used_ram / (1024 ** 2), 2)
                used_ram_percentage = round((used_ram / total_ram) * 100, 2)

                end_time = time.time()
                response_time = round(end_time - start_time, 2)

                self.update_device_status(device, facts, used_cpu, used_ram_mb, used_ram_percentage,
                                          response_time, config, arp_table, interfaces, interfaces_counters,
                                          bgp_neighbors)
                self.delete_oldest_status(device.id)

        except Exception as e:
            print(f"Failed to connect or retrieve data for {device.ip_address}: {e}")
            self.update_device_status_failure(device.id)

    def update_device_status(self, device: Device, facts: dict, used_cpu: float, used_ram_mb: float,
                             used_ram_percentage: float, response_time: float, config: dict = None, arp_table: list = None,
                             interfaces: dict = None, interfaces_counters: dict = None,
                             bgp_neighbors: dict = None):
        try:
            with app.app_context():
                db.session.begin()
                device_db = Device.query.filter_by(id=device.id).first()
                device_db.current_status = True

                if facts:
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

                if config:
                    device_db.current_configuration = config['startup']

                self.update_device_status_table(device_db.id, True, used_cpu, used_ram_percentage, response_time)

                if arp_table:
                    self.update_arp_table(device_db.id, arp_table)

                if interfaces_counters:
                    self.update_interfaces_table(device_db.id, interfaces, interfaces_counters)

                if bgp_neighbors:
                    self.update_bgp_table(device_db.id, bgp_neighbors)

                db.session.commit()
                db.session.close()

        except SQLAlchemyError as e:
            db.session.rollback()
            print(f"Database error: {e}")

        except Exception as e:
            db.session.rollback()
            print(f"An unexpected error occurred: {e}")


    def update_device_status_table(self, device_id: int, status: bool, cpu: float, memory: float, response_time: float):
        try:
            with app.app_context():
                db.session.begin()
                device_status_db = DeviceStatus(
                    device_id=device_id,
                    timestamp=datetime.now(),
                    status=status,
                    cpu=cpu,
                    memory=memory,
                    response_time=response_time)

                db.session.add(device_status_db)
                db.session.commit()
                db.session.close()

        except SQLAlchemyError as e:
            print(f"Database error: {e}")

        except Exception as e:
            db.session.rollback()
            print(f"An unexpected error occurred: {e}")

    def update_arp_table(self, device_id: int, arp_table: list):
        try:
            with app.app_context():
                db.session.begin()
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
                db.session.close()

        except SQLAlchemyError as e:
            db.session.rollback()
            print(f"Database error when updating ARP table: {e}")

        except Exception as e:
            db.session.rollback()
            print(f"An unexpected error occurred: {e}")

    def update_interfaces_table(self, device_id: int, interfaces: dict, interfaces_counters: dict):
        try:
            with app.app_context():
                db.session.begin()
                DeviceInterface.query.filter_by(device_id=device_id).delete()

                for interface, interfaces_info in interfaces.items():
                    interface_entry = DeviceInterface(device_id=device_id)
                    interface_entry.interface_name = interface
                    interface_entry.is_up = interfaces_info['is_up']
                    interface_entry.is_enabled = interfaces_info['is_enabled']
                    interface_entry.description = interfaces_info['description']
                    interface_entry.last_flapped = interfaces_info['last_flapped']
                    interface_entry.speed = interfaces_info['speed']
                    interface_entry.mac_address = interfaces_info['mac_address']

                    interface_entry.tx_errors = interfaces_counters[interface]['tx_errors']
                    interface_entry.rx_errors = interfaces_counters[interface]['rx_errors']
                    interface_entry.tx_discards = interfaces_counters[interface]['tx_discards']
                    interface_entry.rx_discards = interfaces_counters[interface]['rx_discards']
                    interface_entry.tx_octets = interfaces_counters[interface]['tx_octets']
                    interface_entry.rx_octets = interfaces_counters[interface]['rx_octets']
                    interface_entry.tx_unicast_packets = interfaces_counters[interface]['tx_unicast_packets']
                    interface_entry.rx_unicast_packets = interfaces_counters[interface]['rx_unicast_packets']

                    db.session.add(interface_entry)
                db.session.commit()
                db.session.close()

        except SQLAlchemyError as e:
            db.session.rollback()
            print(f"Database error when updating interfaces table: {e}")

        except Exception as e:
            db.session.rollback()
            print(f"An unexpected error occurred: {e}")

    def update_bgp_table(self, device_id: int, bgp_neighbors: dict):
        try:
            with app.app_context():
                db.session.begin()
                DeviceBgpNeighbor.query.filter_by(device_id=device_id).delete()

                for vrf, vrf_data in bgp_neighbors.items():
                    for neighbor, neighbor_data in vrf_data['peers'].items():
                        bgp_entry = DeviceBgpNeighbor(
                            device_id=device_id,
                            neighbor_address=neighbor,
                            local_as=neighbor_data['local_as'],
                            remote_as=neighbor_data['remote_as'],
                            remote_id=neighbor_data['remote_id'],
                            is_up=neighbor_data['is_up'],
                            is_enabled=neighbor_data['is_enabled'],
                            uptime=neighbor_data['uptime'],
                            sent_prefixes_ipv4=neighbor_data['address_family']['ipv4']['sent_prefixes'],
                            accepted_prefixes_ipv4=neighbor_data['address_family']['ipv4']['accepted_prefixes'],
                            received_prefixes_ipv4=neighbor_data['address_family']['ipv4']['received_prefixes'],
                            sent_prefixes_ipv6=neighbor_data['address_family']['ipv6']['sent_prefixes'],
                            accepted_prefixes_ipv6=neighbor_data['address_family']['ipv6']['accepted_prefixes'],
                            received_prefixes_ipv6=neighbor_data['address_family']['ipv6']['received_prefixes']
                        )
                        db.session.add(bgp_entry)
                db.session.commit()
                db.session.close()

        except SQLAlchemyError as e:
            db.session.rollback()
            print(f"Database error when updating BGP table: {e}")

        except Exception as e:
            db.session.rollback()
            print(f"An unexpected error occurred: {e}")

    def update_device_status_failure(self, device_id: int):
        try:
            with app.app_context():
                db.session.begin()
                device_db = Device.query.filter_by(id=device_id).first()
                device_db.current_status = False
                device_db.response_time = 0
                db.session.commit()
                db.session.close()

        except SQLAlchemyError as e:
            db.session.rollback()
            print(f"Database error: {e}")

        except Exception as e:
            db.session.rollback()
            print(f"An unexpected error occurred: {e}")

    def delete_oldest_status(self, device_id: int):
        try:
            with app.app_context():
                db.session.begin()
                count = DeviceStatus.query.filter_by(device_id=device_id).count()
                if count > self.MAX_RECORDS_PER_DEVICE:
                    excess = count - self.MAX_RECORDS_PER_DEVICE
                    oldest_records = DeviceStatus.query.filter_by(device_id=device_id).order_by(
                        DeviceStatus.timestamp.asc()).limit(excess)

                    for record in oldest_records:
                        db.session.delete(record)
                    db.session.commit()
                    db.session.close()

        except SQLAlchemyError as e:
            db.session.rollback()
            print(f"Database error: {e}")

        except Exception as e:
            db.session.rollback()
            print(f"An unexpected error occurred: {e}")

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
                db.session.begin()
                db.session.query(Host).delete()
                for host in hosts:
                    db.session.add(host)
                db.session.commit()
                db.session.close()
        except Exception as e:
            db.session.rollback()
            print(f"Failed to update hosts: {e}")
