from flask import jsonify
from services.HostManager import get_host_by_id, get_all_hosts
from . import host_bp


@host_bp.route('/<int:host_id>', methods=['GET'])  # Asume que el ID es un entero
def get_host(host_id):
    host = get_host_by_id(host_id)
    if host:
        return jsonify(host.to_dict())


@host_bp.route('/', methods=['GET'])
def get_hosts():
    hosts = get_all_hosts()
    hosts_list = [host.to_dict() for host in hosts]
    return jsonify(hosts_list)
