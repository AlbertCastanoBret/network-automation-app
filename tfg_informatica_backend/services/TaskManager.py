import uuid

import tzlocal
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from apscheduler.triggers.interval import IntervalTrigger

from app import db, app
from models.Device import Device
from models.DeviceTask import DeviceTask
from datetime import datetime, timedelta
from functools import partial

from services.DeviceManager import get_device_by_id, execute_cli_commands

scheduler = BackgroundScheduler()
with app.app_context():
    scheduler.start()


def get_task_by_id(task_id):
    with app.app_context():
        task = DeviceTask.query.get(task_id)
        if task:
            task.is_finished = is_job_finished(task_id)
    return task


def get_all_tasks():
    with app.app_context():
        tasks = DeviceTask.query.all()
        for task in tasks:
            task.is_finished = is_job_finished(task.id)
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
        schedule_task(specific_task, hour, minute, repeat_interval_str, days_str, id)

    return True, None


def task(task_id, device_id, commands):
    print(f"Executing task for device {device_id}")
    with app.app_context():
        db.session.begin()
        results, error = execute_cli_commands(device_id, commands)
        print("Result",  results)
        print("Error: ", error)
        if error:
            DeviceTask.query.filter_by(id=task_id).update({'results': error, 'last_execution_time': datetime.now(), 'is_started': True}, synchronize_session=False)
        else:
            DeviceTask.query.filter_by(id=task_id).update({'results': str(results), 'last_execution_time': datetime.now(), 'is_started': True}, synchronize_session=False)
        db.session.commit()
        db.session.close()


def schedule_task(task, hour, minute, interval_minutes=None, cron_days=None, job_id=None):
    timezone = tzlocal.get_localzone()
    now = datetime.now()
    end_of_day = datetime.combine(now.date(), datetime.max.time())

    task_start_time = datetime.combine(now.date(), datetime.min.time()).replace(hour=hour, minute=minute)
    end_time = task_start_time + timedelta(milliseconds=100)

    def start_task():
        schedule_repeated_tasks(task, interval_minutes, cron_days, job_id)

    if interval_minutes is None and cron_days is None:
        scheduler.add_job(task, CronTrigger(hour=hour, minute=minute, timezone=timezone, end_date=end_time), id=job_id)
    elif interval_minutes is not None and cron_days is None:
        scheduler.add_job(start_task, CronTrigger(hour=hour, minute=minute, timezone=timezone, end_date=end_of_day), id=job_id)
    elif interval_minutes is None and cron_days is not None:
        scheduler.add_job(task, CronTrigger(hour=hour, minute=minute, day_of_week=cron_days, timezone=timezone), id=job_id)
    elif interval_minutes is not None and cron_days is not None:
        scheduler.add_job(start_task, CronTrigger(hour=hour, minute=minute, day_of_week=cron_days, timezone=timezone), id=job_id)


def schedule_repeated_tasks(task, interval_minutes, cron_days=None, job_id=None):
    now = datetime.now() + timedelta(seconds=1)
    end_of_day = datetime.combine(now.date(), datetime.max.time())

    if cron_days is not None and now.strftime('%a').lower()[:3] not in cron_days.split(','):
        return

    scheduler.add_job(task, IntervalTrigger(minutes=interval_minutes, start_date=now, end_date=end_of_day), id=job_id)

    scheduler.add_job(
        lambda: schedule_repeated_tasks(task, interval_minutes, cron_days, job_id),
        'date',
        run_date=end_of_day + timedelta(seconds=1)
    )


def pause_task_by_task_id(job_id):
    scheduler.pause_job(job_id)
    db.session.begin()
    DeviceTask.query.filter_by(id=job_id).update({'is_paused': True}, synchronize_session=False)
    db.session.commit()
    db.session.close()


def resume_task_by_task_id(job_id):
    scheduler.resume_job(job_id)
    db.session.begin()
    DeviceTask.query.filter_by(id=job_id).update({'is_paused': False}, synchronize_session=False)
    db.session.commit()
    db.session.close()


def is_job_finished(job_id):
    job = scheduler.get_job(job_id)
    if job is None:
        return True
    return False


def stop_task_by_task_id(job_id):
    scheduler.remove_job(job_id)
    db.session.begin()
    DeviceTask.query.filter_by(id=job_id).update({'is_paused': False, 'is_started': False, 'is_finished': True}, synchronize_session=False)
    db.session.commit()
    db.session.close()


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
