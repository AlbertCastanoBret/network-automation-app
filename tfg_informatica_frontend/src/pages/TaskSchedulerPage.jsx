import React, { useCallback, useEffect, useState } from 'react'
import { Table } from '../components/common/Table'
import { NavLink } from 'react-router-dom';
import { fetchData } from '../utils/fetchData';

export const TaskSchedulerPage = () => {
  const [taskData, setTaskData] = useState([]);
  const [sortCriteria, setSortCriteria] = useState('id');

  const loadData = useCallback(async () => {
    const apiData = await fetchData('/task-scheduler');
    const mappedData = apiData.map((task) => ({
      id: task.id,
      device_id: task.device_id,
      name: task.name,
      time: task.execution_time,
      dayInterval: task.repeat_interval,
      weekInterval: task.days_of_week,
      lastExecutionTime: task.last_execution_time,
      isStarted: task.is_started,
      isFinished: task.is_finished,
      isPaused: task.is_paused,
    }));

    // Ordenar los datos según el criterio seleccionado
    mappedData.sort((a, b) => {
      if (sortCriteria === 'name' || sortCriteria === 'device_id') {
        return a[sortCriteria].localeCompare(b[sortCriteria]);
      } else {
        return new Date(a[sortCriteria]) - new Date(b[sortCriteria]);
      }
    });

    setTaskData(mappedData);
  }, [sortCriteria]);

  useEffect(() => {
    loadData();

    const intervalId = setInterval(() => {
      loadData();
    }, 10000);

    return () => {
      clearInterval(intervalId);
    };
  }, [loadData]);

  const onPause = async (id) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/task-scheduler/pause/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        console.log('Task paused successfully');
        loadData();
      } else {
        console.log('Failed to pause task');
      }
    } catch (error) {
      console.error('Error pausing task:', error);
    }
  }
  
  const onResume = async (id) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/task-scheduler/resume/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        console.log('Task resumed successfully');
        loadData();
      } else {
        console.log('Failed to resume task');
      }
    } catch (error) {
      console.error('Error resuming task:', error);
    }
  }

  const onStop = async (id) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/task-scheduler/stop/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        console.log('Task stopped successfully');
        loadData();
      } else {
        console.log('Failed to stop task');
      }
    } catch (error) {
      console.error('Error stopping task:', error);
    }
  }

  const columns = [
    { title: 'Id', field: 'id'},
    { title: 'Device Id', field: 'device_id'},
    { title: 'Name', field: 'name' },
    { title: 'Start Execution Time', field: 'time' },
    { title: 'Day Interval (Minutes)', field: 'dayInterval'},
    { title: 'Week Interval', field: 'weekInterval'},
    { title: 'Last Execution Time', field: 'lastExecutionTime'},
    { title: 'Data', field: 'data'},
    { title: 'Play/Pause', field: 'play_pause'},
    { title: 'Stop', field: 'stop'}
  ];

  return (
    <div className="task-page">
      <h1>Task Scheduler</h1>
      <div className="header">
        <NavLink to={`/task-scheduler/task-edit`}>
            <button style={
                {padding: '8px 16px', marginRight: '10px'}}>
                New Task
            </button>
        </NavLink>
        <select className="task-selector" value={sortCriteria} onChange={(e) => setSortCriteria(e.target.value)}>
          <option value="id">ID</option>
          <option value="device_id">Device ID</option>
          <option value="name">Name</option>
          <option value="time">Execution Time</option>
          <option value="lastExecutionTime">Last Execution Time</option>
        </select>
      </div>
      <Table columns={columns} data={taskData} onPause={onPause} onResume={onResume} onStop={onStop}></Table>
    </div>
  )
}
