from app import db
import uuid
from sqlalchemy import Column, String


class DeviceArpEntry(db.Model):
    __tablename__ = "device_arp_entry"

    id = db.Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), unique=True)
    device_id = db.Column(db.Integer, db.ForeignKey('device.id'), nullable=False)

    ip_address = db.Column(db.String(45), nullable=False)
    mac_address = db.Column(db.String(17), nullable=False)
    interface = db.Column(db.String(50), nullable=False)

    def to_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}
