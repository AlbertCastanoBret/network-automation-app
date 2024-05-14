from flask import jsonify
from services.DeviceManager import get_device_by_id, get_all_devices, get_device_status_list
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


@device_bp.route('/device_status/<int:device_id>', methods=['GET'])
def get_device_status(device_id):
    device_status = get_device_status_list(device_id)
    device_status_list = [status.to_dict() for status in device_status]
    return jsonify(device_status_list)

