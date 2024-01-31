from flask import Blueprint

device_bp = Blueprint('device_bp', __name__)

from . import device_routes
