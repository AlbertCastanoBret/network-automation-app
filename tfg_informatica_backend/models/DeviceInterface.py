from app import db
from datetime import datetime
import uuid
from sqlalchemy import Column, String


class DeviceInterface(db.Model):
    __tablename__ = "device_interface"

    id = db.Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), unique=True)
    device_id = db.Column(db.Integer, db.ForeignKey('device.id'), nullable=False)

    interface_name = db.Column(db.String(100), nullable=False)
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
