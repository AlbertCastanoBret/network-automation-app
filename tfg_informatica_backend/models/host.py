from app import db


class Host(db.Model):

    __tablename__ = "host"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    ip_address = db.Column(db.String(15), nullable=False)
    mac_address = db.Column(db.String(100), nullable=False)

