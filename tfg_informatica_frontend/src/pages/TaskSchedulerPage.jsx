import React from 'react'
import { Table } from '../components/common/Table'
import { NavLink } from 'react-router-dom';

export const TaskSchedulerPage = () => {


    const columns = [
        { title: 'Id', field: 'id' },
        { title: 'Name', field: 'name' },
        { title: 'Data', field: 'date' },
        { title: 'Edit', field: 'edit' },
    ];

    const data = [
        { id: 1, name: 'Task 1', date: '2021-10-10' },
        { id: 2, name: 'Task 2', date: '2021-10-11' },
        { id: 3, name: 'Task 3', date: '2021-10-12' },
        { id: 4, name: 'Task 4', date: '2021-10-13' },
        { id: 5, name: 'Task 5', date: '2021-10-14' },
    ]

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
      <Table columns={columns} data={data}></Table>
    </div>
  )
}
