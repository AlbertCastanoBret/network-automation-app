from app import db
from datetime import datetime


class Device(db.Model):

    __tablename__ = "device"

    id = db.Column(db.Integer, primary_key=True)
    ip_address = db.Column(db.String(15), nullable=True)
    username = db.Column(db.String(50), nullable=False)
    password = db.Column(db.String(100), nullable=False)

    # transport = db.Column(db.String(50), nullable=False)
    domain_name = db.Column(db.String(100), nullable=True)
    mac_address = db.Column(db.String(100), nullable=True)
    ssh_port = db.Column(db.Integer, default=22)
    os = db.Column(db.String(50), nullable=False)

    fqdn = db.Column(db.String(100), nullable=True)
    hostname = db.Column(db.String(50), nullable=False)
    model = db.Column(db.String(100), nullable=True)
    os_version = db.Column(db.String(200))
    serial_number = db.Column(db.String(100), nullable=True)
    vendor = db.Column(db.String(50), nullable=False)
    uptime = db.Column(db.Float, nullable=True)

    current_status = db.Column(db.Boolean, default=False)
    cpu = db.Column(db.String(50))
    memory = db.Column(db.Float, default=0.0)
    memory_percentage = db.Column(db.Float, default=0.0)

    response_time = db.Column(db.Float, nullable=True)
    last_checked = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}
