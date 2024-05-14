from app import db
from datetime import datetime
import uuid
from sqlalchemy import Column, String


class DeviceStatus(db.Model):
    __tablename__ = "device_status"

    id = db.Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), unique=True, nullable=False)
    device_id = db.Column(db.Integer)

    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.Boolean, default=False)
    cpu = db.Column(db.String(50))
    memory = db.Column(db.String(200))
    response_time = db.Column(db.Float, nullable=True)

    def to_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}