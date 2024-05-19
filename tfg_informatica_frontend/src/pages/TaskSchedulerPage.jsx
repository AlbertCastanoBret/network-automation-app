import React, { useEffect, useState } from 'react'
import { Table } from '../components/common/Table'
import { NavLink } from 'react-router-dom';
import { fetchData } from '../utils/fetchData';

export const TaskSchedulerPage = () => {

  const [taskData, setTaskData] = useState([])

  useEffect(() => {
    const loadData = async () => {
      const apiData = await fetchData('/task-scheduler');
      const mappedData = apiData.map((task) => ({
        id: task.id,
        device_id: task.device_id,
        name: task.name,
        time: task.execution_time,
        day_interval: task.repeat_interval,
        week_interval: task.days_of_week,
        last_execution_time: task.last_execution_time,
        task_results: task.results
      }));
      setTaskData(mappedData);
    };

    loadData();

    const intervalId = setInterval(() => {
      loadData();
    }, 10000)

    return () => {
      clearInterval(intervalId);
    }
  }, []); 

  const columns = [
    { title: 'Id', field: 'id'},
    { title: 'Device Id', field: 'device_id'},
    { title: 'Name', field: 'name' },
    { title: 'Start Execution Time', field: 'time' },
    { title: 'Day Interval (Minutes)', field: 'day_interval'},
    { title: 'Week Interval', field: 'week_interval'},
    { title: 'Last Execution Time', field: 'last_execution_time'},
    { title: 'Data', field: 'data'}
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
      </div>
      <Table columns={columns} data={taskData}></Table>
    </div>
  )
}
