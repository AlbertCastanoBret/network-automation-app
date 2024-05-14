import asyncio
import time

import netifaces
from ipaddress import ip_network
from napalm import get_network_driver
from app import app, db
from models.Device import Device
from models.DeviceStatus import DeviceStatus
from models.Host import Host
from services.DeviceManager import get_all_devices
import scapy.all as s
from datetime import datetime


class AsyncTaskManager:
    MAX_RECORDS_PER_DEVICE = 5

    async def monitor_devices(self, device_monitor_interval):
        while True:
            devices = get_all_devices()

            for device in devices:
                start_time = time.time()
                try:
                    driver = get_network_driver(device.os)
                    with driver(device.ip_address, device.username, device.password) as device_conn:
                        facts = device_conn.get_facts()
                        environment = device_conn.get_environment()
                        used_cpu = round(sum(cpu_info["%usage"] for cpu_info in environment['cpu'].values()) / len(
                            environment['cpu']), 2)

                        used_ram = environment['memory']['used_ram']
                        total_ram = environment['memory']['available_ram']
                        used_ram_mb = round(used_ram / (1024 ** 2), 2)
                        used_ram_percentage = round((used_ram / total_ram) * 100, 2)

                        end_time = time.time()
                        response_time = round(end_time - start_time, 2)

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

                            device_status_db = DeviceStatus(
                                device_id=device.id,
                                timestamp=datetime.now(),
                                status=True,
                                cpu=used_cpu,
                                memory=used_ram_mb,
                                response_time=response_time)
                            db.session.add(device_status_db)
                            db.session.commit()

                            self.delete_oldest_status(device.id)

                except Exception as e:
                    print(f"Failed to connect or retrieve data for {device.ip_address}: {e}")
                    with app.app_context():
                        device_db = Device.query.filter_by(id=device.id).first()
                        device_db.current_status = False
                        device_db.response_time = 0
                        db.session.commit()

            print(f"Completed monitoring cycle for {len(devices)} devices.")
            await asyncio.sleep(device_monitor_interval)

    def delete_oldest_status(self, device_id):
        with app.app_context():
            count = DeviceStatus.query.filter_by(device_id=device_id).count()

            if count > self.MAX_RECORDS_PER_DEVICE:
                excess = count - self.MAX_RECORDS_PER_DEVICE
                oldest_records = DeviceStatus.query.filter_by(device_id=device_id).order_by(
                    DeviceStatus.timestamp.asc()).limit(excess)

                for record in oldest_records:
                    db.session.delete(record)
                db.session.commit()

    async def monitor_hosts(self, host_monitor_interval):
        while True:
            with app.app_context():
                db.session.query(Host).delete()
                gateways = netifaces.gateways()
                default_gateway = gateways['default'][netifaces.AF_INET][1]

                addrs = netifaces.ifaddresses(default_gateway)
                ip_info = addrs[netifaces.AF_INET][0]
                ip_address = ip_info['addr']
                netmask = ip_info['netmask']

                network = ip_network(f"{ip_address}/{netmask}", strict=False)

                ans, _ = s.arping(str(network))

                for _, received in ans:
                    ip_address = received.psrc
                    mac_address = received.hwsrc
                    hostname = "Unknown"

                    host = Host(name=hostname, ip_address=ip_address, mac_address=mac_address)
                    db.session.add(host)
                    db.session.commit()

                print(f"Completed monitoring cycle for {len(ans)} hosts.")
            await asyncio.sleep(host_monitor_interval)
