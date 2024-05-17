import yaml
from datetime import datetime
from models.Device import Device
from models.DeviceStatus import DeviceStatus
from models.DeviceArpEntry import DeviceArpEntry
from models.DeviceInterface import DeviceInterface
from models.DeviceBgpNeighbor import DeviceBgpNeighbor
from models.DeviceConfig import DeviceConfig
from app import db, app
from napalm import get_network_driver
from netmiko import ConnectHandler
import difflib


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


def execute_cli_commands(device_id, commands, is_config=False):
    device = get_device_by_id(device_id)
    if not device:
        return None, "Device not found"

    device_params = {
        'device_type': device.device_type,
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
                    net_connect.save_config()
        return results, None
    except Exception as e:
        return None, str(e)


def set_backup_device_configuration(device_id):
    device = Device.query.get(device_id)
    if not device:
        return None, "Device not found"

    driver = get_network_driver(device.os)
    with driver(device.ip_address, device.username, device.password) as device_conn:
        config = device_conn.get_config()

    backup_entry = DeviceConfig(
        device_id=device_id,
        config=config['running'],
        timestamp=datetime.now()
    )

    with app.app_context():
        db.session.add(backup_entry)
        db.session.commit()

    return True, None


def get_backup_configuration(backup_id):
    return DeviceConfig.query.get(backup_id)


def get_backup_configurations_for_device(device_id):
    return DeviceConfig.query.filter_by(device_id=device_id).all()


def restore_device_configuration(device_id, backup_id):
    device = Device.query.get(device_id)
    backup = DeviceConfig.query.get(backup_id)
    if not device or not backup:
        return None, "Device or backup not found"

    device_params = {
        'device_type': device.device_type,
        'ip': device.ip_address,
        'username': device.username,
        'password': device.password,
        'port': device.ssh_port,
        'session_log': 'netmiko_session.log'
    }

    try:
        with ConnectHandler(**device_params) as net_connect:
            net_connect.send_config_set(backup.config.split('\n'))
            net_connect.save_config()
        return True, None
    except Exception as e:
        return None, str(e)


def compare_configurations(config1, config2):
    diff = difflib.unified_diff(
        config1.splitlines(keepends=True),
        config2.splitlines(keepends=True),
        fromfile='current',
        tofile='backup'
    )
    return ''.join(diff)


def delete_backups(device_id, backup_ids):
    try:
        DeviceConfig.query.filter(
            DeviceConfig.device_id == device_id,
            DeviceConfig.id.in_(backup_ids)
        ).delete(synchronize_session=False)

        db.session.commit()
    except Exception as e:
        db.session.rollback()
        raise e


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
