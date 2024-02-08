from os import abort
from flask import jsonify

from services.DeviceManager import get_device_by_id
from . import device_bp


@device_bp.route('/<int:device_id>', methods=['GET'])  # Asume que el ID es un entero
def get_device(device_id):
    device = get_device_by_id(device_id)
    if device:
        return jsonify(device.to_dict())
