from flask import Blueprint

device_bp = Blueprint('device_bp', __name__)
host_bp = Blueprint('host_bp', __name__)
task_scheduler_bp = Blueprint('task_scheduler_bp', __name__)

from . import DeviceRoutes
from . import TaskSchedulerRoutes
from . import HostRoutes

