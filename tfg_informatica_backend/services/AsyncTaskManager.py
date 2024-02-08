import asyncio
import socket

from napalm import get_network_driver

from app import app, db
from models.device import Device
from services.DeviceManager import get_all_devices


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
                        used_ram_mb = round(environment['memory']['used_ram'] / (1024 ** 2), 2)

                        with app.app_context():
                            device_db = Device.query.filter_by(id=device.id).first()
                            device_db.current_status = True
                            device_db.os_version = facts['os_version']
                            device_db.cpu = round(sum(cpu_info["%usage"] for cpu_info in environment['cpu'].values()) / len(environment['cpu']), 2)
                            device_db.memory = used_ram_mb
                            db.session.commit()
                except Exception as e:
                    print(f"Failed to connect or retrieve data for {device.ip_address}: {e}")
                    with app.app_context():
                        device_db = Device.query.filter_by(id=device.id).first()
                        device_db.current_status = False
                        db.session.commit()

            print(f"Completed monitoring cycle for {len(devices)} devices.")
            await asyncio.sleep(device_monitor_interval)

    async def monitor_services(self, compliance_monitor_interval):
        while True:
            print("Monitoring services...")
            await asyncio.sleep(compliance_monitor_interval)
