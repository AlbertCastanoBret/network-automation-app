from flask import jsonify
from flask import request
from napalm import get_network_driver
from services.DeviceManager import get_device_by_id, get_all_devices, get_device_status_for_device, \
    get_arp_entries_for_device, get_interfaces_for_device, get_bgp_entries_for_device, execute_cli_commands, \
    set_backup_device_configuration, restore_device_configuration, compare_configurations, \
    get_backup_configuration, get_backup_configurations_for_device, delete_backups
from . import device_bp


@device_bp.route('/<int:device_id>', methods=['GET'])
def get_device(device_id):
    device = get_device_by_id(device_id)
    if device:
        return jsonify(device.to_dict())


@device_bp.route('/', methods=['GET'])
def get_devices():
    devices = get_all_devices()
    devices_list = [device.to_dict() for device in devices]
    return jsonify(devices_list)


@device_bp.route('/status/<int:device_id>', methods=['GET'])
def get_device_status(device_id):
    device_status = get_device_status_for_device(device_id)
    device_status_list = [status.to_dict() for status in device_status]
    return jsonify(device_status_list)


@device_bp.route('/arp_table/<int:device_id>', methods=['GET'])
def get_device_arp_table(device_id):
    arp_table = get_arp_entries_for_device(device_id)
    arp_table_list = [arp.to_dict() for arp in arp_table]
    return jsonify(arp_table_list)


@device_bp.route('/interfaces/<int:device_id>', methods=['GET'])
def get_device_interface(device_id):
    interfaces = get_interfaces_for_device(device_id)
    interfaces_list = [interface.to_dict() for interface in interfaces]
    return jsonify(interfaces_list)


@device_bp.route('/bgp_neighbors/<int:device_id>', methods=['GET'])
def get_device_bgp_neighbors(device_id):
    bgp_neighbors = get_bgp_entries_for_device(device_id)
    bgp_neighbors_list = [bgp.to_dict() for bgp in bgp_neighbors]
    return jsonify(bgp_neighbors_list)


@device_bp.route('/cli/<int:device_id>', methods=['POST'])
def execute_commands(device_id):
    data = request.json
    commands = data.get('commands')

    if not commands or not isinstance(commands, list):
        return jsonify({"error": "Invalid or no commands provided"}), 400

    results, error = execute_cli_commands(device_id, commands)
    if error:
        return jsonify({"error": error}), 500
    return jsonify(results)


@device_bp.route('/backup/<string:backup_id>', methods=['GET'])
def get_device_backup(backup_id):
    backup = get_backup_configuration(backup_id)
    if backup:
        return jsonify(backup.to_dict())


@device_bp.route('/backup/<int:device_id>', methods=['GET'])
def get_device_backups(device_id):
    device = get_device_by_id(device_id)
    if not device:
        return jsonify({"error": "Device not found"}), 400

    backups = get_backup_configurations_for_device(device_id)
    backups_list = [backup.to_dict() for backup in backups]
    return jsonify(backups_list)


@device_bp.route('/backup/<int:device_id>', methods=['POST'])
def backup_device(device_id):
    success, error = set_backup_device_configuration(device_id)
    if success:
        return jsonify({"message": "Backup successful"}), 200
    else:
        return jsonify({"error": error}), 400


@device_bp.route('/backup/<int:device_id>', methods=['DELETE'])
def delete_device_backups(device_id):
    data = request.get_json()
    backup_ids = data.get('backups', [])

    if not backup_ids:
        return jsonify({"error": "No backup IDs provided"}), 400

    try:
        delete_backups(device_id, backup_ids)
        return jsonify({"message": "Backups deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@device_bp.route('/restore/<int:device_id>/<string:backup_id>', methods=['POST'])
def restore_device(device_id, backup_id):
    success, error = restore_device_configuration(device_id, backup_id)
    if success:
        return jsonify({"message": "Restore successful"}), 200
    else:
        return jsonify({"error": error}), 400


@device_bp.route('/compare/<int:device_id>/<string:backup_id>', methods=['GET'])
def compare_device_configs(device_id, backup_id):
    device = get_device_by_id(device_id)
    backup = get_backup_configuration(backup_id)
    if not device or not backup:
        return jsonify({"error": "Device or backup not found"}), 400

    driver = get_network_driver(device.os)
    with driver(device.ip_address, device.username, device.password) as device_conn:
        current_config = device_conn.get_config()['running']

    diff = compare_configurations(current_config, backup.config)
    return jsonify({"diff": diff}), 200