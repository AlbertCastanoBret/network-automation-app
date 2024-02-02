import asyncio
import socket

from app import app
from services.DeviceManager import get_all_devices


class AsyncTaskManager:
    async def monitor_device(self, device_monitor_interval):
        while True:
            print("Monitoring devices...")
            await asyncio.sleep(device_monitor_interval)

    async def monitor_services(self, compliance_monitor_interval):
        while True:
            print("Monitoring services...")
            await asyncio.sleep(compliance_monitor_interval)
