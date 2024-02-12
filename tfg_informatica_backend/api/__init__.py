from flask import Blueprint

device_bp = Blueprint('device_bp', __name__)
host_bp = Blueprint('host_bp', __name__)

from . import device_routes
from . import host_routes
