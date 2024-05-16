import yaml
from datetime import datetime
from models.Device import Device
from models.DeviceStatus import DeviceStatus
from models.DeviceArpEntry import DeviceArpEntry
from models.DeviceInterface import DeviceInterface
from models.DeviceBgpNeighbor import DeviceBgpNeighbor
from app import db, app
from napalm import get_network_driver
from netmiko import ConnectHandler


def import_devices_from_file(filename, filetype):
    with app.app_context():
        db.session.query(Device).delete()
        try:
            with open('data/' + filename + "." + filetype, "r") as import_file:
                if filetype.lower() == "yaml":
                    devices = yaml.safe_load(import_file)
                else:
                    raise ValueError("Unsupported filetype provided")

            set_devices(devices)
            return True
        except Exception as e:
            print(str(datetime.now()), "import error", filename, "ERROR", str(e))
            return False


def get_device_by_id(device_id):
    return Device.query.get(device_id)


def get_device_status_for_device(device_id):
    return DeviceStatus.query.filter_by(device_id=device_id).order_by(DeviceStatus.timestamp).all()


def get_arp_entries_for_device(device_id):
    return DeviceArpEntry.query.filter_by(device_id=device_id).all()


def get_interfaces_for_device(device_id):
    return DeviceInterface.query.filter_by(device_id=device_id).all()


def get_bgp_entries_for_device(device_id):
    return DeviceBgpNeighbor.query.filter_by(device_id=device_id).all()


def get_all_devices():
    with app.app_context():
        devices = Device.query.all()
    return devices


from netmiko import ConnectHandler


def execute_cli_commands(device_id, commands, is_config=False):
    device = get_device_by_id(device_id)
    if not device:
        return None, "Device not found"

    device_params = {
        'device_type': 'cisco_xe',
        'ip': device.ip_address,
        'username': device.username,
        'password': device.password,
        'port': device.ssh_port,
        'session_log': 'netmiko_session.log'
    }

    results = {}
    try:
        with ConnectHandler(**device_params) as net_connect:
            if is_config:
                output = net_connect.send_config_set(commands)
                results["config_commands"] = output
            else:
                for command in commands:
                    output = net_connect.send_command(command, expect_string=r"#", read_timeout=60)
                    results[command] = output
        return results, None
    except Exception as e:
        return None, str(e)


def set_devices(devices):
    ids = set()
    names = set()

    for device in devices:
        device_id = device.get("id")
        device_name = device.get("name")

        if device_id in ids:
            print(str(datetime.now()), "duplicate id", device_id, "ERROR", "Duplicate device id")
            continue
        if device_name in names:
            print(str(datetime.now()), "duplicate name", device_name, "ERROR", "Duplicate device name")
            continue
        ids.add(device_id)
        names.add(device_name)

        try:
            device_obj = Device(**device)
            db.session.add(device_obj)
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            print(str(datetime.now()), "db insertion error", device_id, "ERROR", str(e))
            continue

    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        print(datetime.now()), "db final commit error", device_id, "ERROR", str(e)
