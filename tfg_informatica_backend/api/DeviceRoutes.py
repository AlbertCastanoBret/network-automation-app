from flask import jsonify
from flask import request
from services.DeviceManager import get_device_by_id, get_all_devices, get_device_status_for_device, \
    get_arp_entries_for_device, get_interfaces_for_device, get_bgp_entries_for_device, execute_cli_command
from . import device_bp


@device_bp.route('/<int:device_id>', methods=['GET'])  # Asume que el ID es un entero
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
def execute_command(device_id):
    data = request.json
    command = data.get('command')
    if not command:
        return jsonify({"error": "No command provided"}), 400

    result, error = execute_cli_command(device_id, command)
    if error:
        return jsonify({"error": error}), 500
    return jsonify(result)
