import uuid

import tzlocal
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from apscheduler.triggers.interval import IntervalTrigger
from netmiko import ConnectHandler

from app import db, app
from models.Device import Device
from models.DeviceTask import DeviceTask
from datetime import datetime, timedelta
from functools import partial

from services.DeviceManager import get_device_by_id, execute_cli_commands

scheduler = BackgroundScheduler()
with app.app_context():
    scheduler.start()


def get_all_tasks():
    with app.app_context():
        tasks = DeviceTask.query.all()
    return tasks


def set_task(data):
    id = str(uuid.uuid4())
    device_ids = data.get('selectedDevices')
    name = data.get('name')
    commands = data.get('commands')
    execution_time = data.get('time')
    days_of_week = ''

    if data.get('repeatInterval') != 'Custom':
        repeat_interval = data.get('repeatInterval')
    else:
        repeat_interval = int(data.get('customInterval'))

    if data.get('weekRepeatInterval') != 'Custom':
        days_of_week = data.get('weekRepeatInterval')
    else:
        for day in data.get('customDays'):
            days_of_week += day + ', '

    with app.app_context():
        db.session.begin()
        for device_id in device_ids:
            device = Device.query.get(device_id)
            if not device:
                return False, f"Device with id {device_id} not found"

            device_task = DeviceTask(
                id=id,
                device_id=device_id,
                name=name,
                commands=commands,
                execution_time=execution_time,
                repeat_interval=repeat_interval,
                days_of_week=days_of_week,
            )
            db.session.add(device_task)
        db.session.commit()
        db.session.close()

    commands_list = [cmd.strip() for cmd in commands.split(',') if cmd.strip()]

    hour_str, minute_str = execution_time.split(':')
    hour = int(hour_str)
    minute = int(minute_str)

    if repeat_interval == 0:
        repeat_interval_str = None
    else:
        repeat_interval_str = int(repeat_interval)

    if days_of_week == 'Once':
        days_str = None
    elif days_of_week == 'Daily':
        days_str = 'mon,tue,wed,thu,fri,sat,sun'
    elif days_of_week == 'Weekdays':
        days_str = 'mon,tue,wed,thu,fri'
    else:
        days_str = convert_days_to_cron_format(days_of_week)

    for device_id in device_ids:
        specific_task = partial(task, task_id=id, device_id=device_id, commands=commands_list)
        schedule_task(specific_task, hour, minute, repeat_interval_str, days_str)

    return True, None


def task(task_id, device_id, commands):
    print(f"Executing task for device {device_id}")
    with app.app_context():
        db.session.begin()
        results, error = execute_cli_commands(device_id, commands)
        print("Result",  results)
        print("Error: ", error)
        if error:
            DeviceTask.query.filter_by(id=task_id).update({'results': error}, synchronize_session=False)
        else:
            DeviceTask.query.filter_by(id=task_id).update({'results': str(results)}, synchronize_session=False)
        db.session.commit()
        db.session.close()


def schedule_task(task, hour, minute, interval_minutes=None, cron_days=None):
    timezone = tzlocal.get_localzone()
    now = datetime.now()
    end_of_day = datetime.combine(now.date(), datetime.max.time())

    def start_task():
        schedule_repeated_tasks(task, interval_minutes, cron_days)

    if interval_minutes is None and cron_days is None:
        scheduler.add_job(task, CronTrigger(hour=hour, minute=minute, timezone=timezone, end_date=end_of_day))
    elif interval_minutes is not None and cron_days is None:
        scheduler.add_job(start_task, CronTrigger(hour=hour, minute=minute, timezone=timezone, end_date=end_of_day))
    elif interval_minutes is None and cron_days is not None:
        scheduler.add_job(task, CronTrigger(hour=hour, minute=minute, day_of_week=cron_days, timezone=timezone))
    elif interval_minutes is not None and cron_days is not None:
        scheduler.add_job(start_task, CronTrigger(hour=hour, minute=minute, day_of_week=cron_days, timezone=timezone))


def schedule_repeated_tasks(task, interval_minutes, cron_days=None):
    now = datetime.now()
    end_of_day = datetime.combine(now.date(), datetime.max.time())

    print(now.strftime('%a').lower()[:3])
    if cron_days and now.strftime('%a').lower()[:3] not in cron_days.split(','):
        return

    scheduler.add_job(task, IntervalTrigger(minutes=interval_minutes, start_date=now, end_date=end_of_day))

    scheduler.add_job(
        lambda: schedule_repeated_tasks(task, interval_minutes, cron_days),
        'date',
        run_date=end_of_day + timedelta(seconds=1)
    )


def convert_days_to_cron_format(days_str):
    days_map = {
        "Monday": "mon",
        "Tuesday": "tue",
        "Wednesday": "wed",
        "Thursday": "thu",
        "Friday": "fri",
        "Saturday": "sat",
        "Sunday": "sun"
    }

    days_list = [day.strip() for day in days_str.split(",")]

    cron_days = [days_map[day] for day in days_list if day in days_map]

    return ",".join(cron_days)
