from app import db
from datetime import datetime


class Device(db.Model):

    __tablename__ = "device"

    id = db.Column(db.Integer, primary_key=True)
    ip_address = db.Column(db.String(15), nullable=False)
    username = db.Column(db.String(50), nullable=False)
    password = db.Column(db.String(100), nullable=False)

    # transport = db.Column(db.String(50), nullable=False)
    domain_name = db.Column(db.String(100), nullable=True)
    mac_address = db.Column(db.String(100), nullable=True)
    ssh_port = db.Column(db.Integer, default=22, nullable=True)
    os = db.Column(db.String(50), nullable=True)

    fqdn = db.Column(db.String(100), nullable=True)
    hostname = db.Column(db.String(50), nullable=True)
    model = db.Column(db.String(100), nullable=True)
    os_version = db.Column(db.String(200), nullable=True)
    device_type = db.Column(db.String(50), nullable=True)
    serial_number = db.Column(db.String(100), nullable=True)
    vendor = db.Column(db.String(50), nullable=True)
    uptime = db.Column(db.Float, nullable=True)

    current_status = db.Column(db.Boolean, default=False, nullable=False)
    cpu = db.Column(db.String(50), default=0.0, nullable=False)
    memory = db.Column(db.Float, default=0.0, nullable=False)
    memory_percentage = db.Column(db.Float, default=0.0, nullable=False)

    response_time = db.Column(db.Float, default=0.0, nullable=False)
    last_checked = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    current_configuration = db.Column(db.String(), nullable=True)

    device_statuses = db.relationship('DeviceStatus', backref='device', lazy=True)
    arp_entries = db.relationship('DeviceArpEntry', backref='device', lazy=True)
    interfaces = db.relationship('DeviceInterface', backref='device', lazy=True)
    bgp_neighbors = db.relationship('DeviceBgpNeighbor', backref='device', lazy=True)

    def to_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}
