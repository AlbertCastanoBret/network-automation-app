from app import db


class Device(db.Model):

    __tablename__ = "device"

    id = db.Column(db.Integer, primary_key=True)
    ip_address = db.Column(db.String(15), nullable=True)
    name = db.Column(db.String(50), nullable=False)
    os = db.Column(db.String(50), nullable=False)
    transport = db.Column(db.String(50), nullable=False)
    domain_name = db.Column(db.String(100), nullable=False)
    password = db.Column(db.String(100), nullable=False)
    ssh_port = db.Column(db.Integer, default=22)
    username = db.Column(db.String(50), nullable=False)
    vendor = db.Column(db.String(50), nullable=False)


