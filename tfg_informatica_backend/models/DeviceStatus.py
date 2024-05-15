from app import db
from datetime import datetime
import uuid
from sqlalchemy import Column, String


class DeviceStatus(db.Model):
    __tablename__ = "device_status"

    id = db.Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), unique=True)
    device_id = db.Column(db.Integer, db.ForeignKey('device.id'), nullable=False)

    timestamp = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    status = db.Column(db.Boolean, default=False, nullable=False)
    cpu = db.Column(db.String(50), default=0.0, nullable=False)
    memory = db.Column(db.String(200), default=0.0, nullable=False)
    response_time = db.Column(db.Float, default=0.0, nullable=False)

    def to_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}