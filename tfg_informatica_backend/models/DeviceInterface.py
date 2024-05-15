from app import db
from datetime import datetime
import uuid
from sqlalchemy import Column, String


class DeviceInterface(db.Model):
    __tablename__ = "device_interface"

    id = db.Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), unique=True)
    device_id = db.Column(db.Integer, db.ForeignKey('device.id'), nullable=False)

    interface_name = db.Column(db.String(100), nullable=False)
    is_up = db.Column(db.Boolean, default=False, nullable=False)
    is_enabled = db.Column(db.Boolean, default=False, nullable=False)
    description = db.Column(db.Text, nullable=True)
    last_flapped = db.Column(db.Float, default=-1.0, nullable=False)
    speed = db.Column(db.Float, default=0.0, nullable=False)
    mac_address = db.Column(db.String(17), nullable=True)

    tx_errors = db.Column(db.BigInteger, default=0, nullable=False)
    rx_errors = db.Column(db.BigInteger, default=0, nullable=False)

    tx_discards = db.Column(db.BigInteger, default=0, nullable=False)
    rx_discards = db.Column(db.BigInteger, default=0, nullable=False)

    tx_octets = db.Column(db.BigInteger, default=0, nullable=False)
    rx_octets = db.Column(db.BigInteger, default=0, nullable=False)

    tx_unicast_packets = db.Column(db.BigInteger, default=0, nullable=False,)
    rx_unicast_packets = db.Column(db.BigInteger, default=0, nullable=False)

    def to_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}
