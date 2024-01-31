from . import device_bp


@device_bp.route('/a', methods=['GET'])
def get_device():
    return {"Device": "1"}
