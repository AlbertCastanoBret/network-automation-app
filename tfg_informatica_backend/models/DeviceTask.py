from app import db
import uuid
from sqlalchemy import String


class DeviceTask(db.Model):
    __tablename__ = "device_task"

    id = db.Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), unique=True)
    device_id = db.Column(db.Integer, db.ForeignKey('device.id'), nullable=False)
    name = db.Column(db.String(50), default="Default", nullable=False)

    commands = db.Column(db.Text, default='', nullable=False)
    execution_time = db.Column(db.String(50), nullable=False)
    repeat_interval = db.Column(db.Integer, default=0, nullable=False)
    days_of_week = db.Column(db.String(50), default='(None)', nullable=False)
    results = db.Column(db.Text, default='', nullable=False)

    def to_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}