import asyncio

import netifaces
from ipaddress import ip_network
from napalm import get_network_driver
from app import app, db
from models.device import Device
from models.host import Host
from services.DeviceManager import get_all_devices
import scapy.all as s
from datetime import datetime


class AsyncTaskManager:
    async def monitor_devices(self, device_monitor_interval):
        while True:
            devices = get_all_devices()

            for device in devices:
                try:
                    driver = get_network_driver(device.os)
                    with driver(device.ip_address, device.username, device.password) as device_conn:
                        facts = device_conn.get_facts()
                        environment = device_conn.get_environment()
                        used_cpu = round(sum(cpu_info["%usage"] for cpu_info in environment['cpu'].values()) / len(
                            environment['cpu']), 2)
                        used_ram_mb = round(environment['memory']['used_ram'] / (1024 ** 2), 2)

                        with app.app_context():
                            device_db = Device.query.filter_by(id=device.id).first()
                            device_db.current_status = True
                            device_db.os_version = facts['os_version']
                            device_db.cpu = used_cpu
                            device_db.memory = used_ram_mb
                            db.session.commit()
                except Exception as e:
                    print(f"Failed to connect or retrieve data for {device.ip_address}: {e}")
                    with app.app_context():
                        device_db = Device.query.filter_by(id=device.id).first()
                        device_db.current_status = False
                        db.session.commit()

            now = datetime.now()
            current_time = now.strftime("%H:%M:%S")
            print("Current Time =", current_time)

            print(f"Completed monitoring cycle for {len(devices)} devices.")
            await asyncio.sleep(device_monitor_interval)

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
