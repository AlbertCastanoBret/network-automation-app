from app import db


class Device(db.Model):

    __tablename__ = "device"

    id = db.Column(db.Integer, primary_key=True)
    ip_address = db.Column(db.String(15), nullable=True)
    hostname = db.Column(db.String(50), nullable=False)
    username = db.Column(db.String(50), nullable=False)
    password = db.Column(db.String(100), nullable=False)

    os = db.Column(db.String(50), nullable=False)
    # transport = db.Column(db.String(50), nullable=False)
    domain_name = db.Column(db.String(100), nullable=True)
    mac_address = db.Column(db.String(100), nullable=True)
    ssh_port = db.Column(db.Integer, default=22)
    vendor = db.Column(db.String(50), nullable=False)

    currentStatus = db.Column(db.Boolean, default=False)
    os_version = db.Column(db.String(200))
    cpu = db.Column(db.String(50))
    memory = db.Column(db.String(200))

    def to_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}
