from flask import jsonify
from flask import request

from services.TaskManager import set_task, get_all_tasks, get_task_by_id, pause_task_by_task_id, resume_task_by_task_id, \
    stop_task_by_task_id
from . import task_scheduler_bp


@task_scheduler_bp.route('/<string:task_id>', methods=['GET'])
def get_task(task_id):
    task = get_task_by_id(task_id)
    if task:
        return jsonify(task.to_dict()), 200
    return jsonify({"error": "Task not found"}), 404


@task_scheduler_bp.route('', methods=['GET'])
def get_tasks():
    tasks = get_all_tasks()
    tasks_list = [task.to_dict() for task in tasks]
    return jsonify(tasks_list), 200


@task_scheduler_bp.route('', methods=['POST'])
def schedule_task():
    print("Scheduling task")
    data = request.json
    if not data:
        return jsonify({"error": "No data provided"}), 400

    success, error = set_task(data)
    if success:
        return jsonify({"success": "Task scheduled"}), 200
    else:
        return jsonify({"error": error}), 400


@task_scheduler_bp.route('/pause/<string:task_id>', methods=['POST'])
def pause_task(task_id):
    pause_task_by_task_id(task_id)
    return jsonify({"success": "Task paused"}), 200


@task_scheduler_bp.route('/resume/<string:task_id>', methods=['POST'])
def resume_task(task_id):
    resume_task_by_task_id(task_id)
    return jsonify({"success": "Task resumed"}), 200


@task_scheduler_bp.route('/stop/<string:task_id>', methods=['POST'])
def stop_task(task_id):
    stop_task_by_task_id(task_id)
    return jsonify({"success": "Task stopped"}), 200

