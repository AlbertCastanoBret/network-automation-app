from app import db
import uuid
from sqlalchemy import Column, String


class DeviceBgpNeighbor(db.Model):
    __tablename__ = "device_bgp_neighbor"

    id = db.Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), unique=True)
    device_id = db.Column(db.Integer, db.ForeignKey('device.id'), nullable=False)

    neighbor_address = db.Column(db.String(50), nullable=False)
    local_as = db.Column(db.String(50), nullable=False)
    remote_as = db.Column(db.String(50), nullable=False)
    remote_id = db.Column(db.String(50), nullable=False)

    is_up = db.Column(db.Boolean, default=False, nullable=False)
    is_enabled = db.Column(db.Boolean, default=False, nullable=False)
    uptime = db.Column(db.Integer, default=0, nullable=False)

    sent_prefixes_ipv4 = db.Column(db.Integer, default=0, nullable=False)
    accepted_prefixes_ipv4 = db.Column(db.Integer, default=0, nullable=False)
    received_prefixes_ipv4 = db.Column(db.Integer, default=0, nullable=False)
    sent_prefixes_ipv6 = db.Column(db.Integer, default=0, nullable=False)
    accepted_prefixes_ipv6 = db.Column(db.Integer, default=0, nullable=False)
    received_prefixes_ipv6 = db.Column(db.Integer, default=0, nullable=False)

    def to_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}