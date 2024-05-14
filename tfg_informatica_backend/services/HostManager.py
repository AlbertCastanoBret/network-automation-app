from app import app
from models.Host import Host


def get_host_by_id(device_id):
    return Host.query.get(device_id)


def get_all_hosts():
    with app.app_context():
        hosts = Host.query.all()
    return hosts
