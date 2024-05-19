import React from 'react';
import { FaPause, FaPlay, FaStop, FaTrashRestore } from 'react-icons/fa';
import { FaAngleRight, FaChartSimple, FaGear, FaMagnifyingGlass, FaRegCirclePause } from 'react-icons/fa6';
import { TbFlagPause } from 'react-icons/tb';
import { NavLink } from 'react-router-dom';

export const TableRow = ({ row, columns, index, isExpanded, onToggle, onRestore, onSelect, isLastRow, onPause, onResume, onStop }) => {

  const handleSelectChange = (e) => {
    onSelect(e, row.id);
  };

  return (
    <tr>
      {columns.map((column) => {
        let cellData;
        if (column.field === 'actions') {
          cellData = (
            <div>
              <NavLink className="icon-button" to={`/devices/device-data?deviceId=${index + 1}`}>
                <FaChartSimple />
              </NavLink>
              <NavLink className="icon-button" to={`/devices/device-configuration?deviceId=${index + 1}`}>
                <FaGear />
              </NavLink>
            </div>
          );
        } else if (column.field === 'arrowButton') {
          cellData = (
            <FaAngleRight
              className={`arrow-button ${isExpanded ? 'expanded' : ''}`}
              onClick={onToggle}
            />
          );
        } else if (column.field === 'restore') {
          cellData = !isLastRow ? (
            <FaTrashRestore
              className="icon-button"
              onClick={() => onRestore(row)}
            />
          ) : null;
        } else if (column.field === 'select'){
          cellData = (
            <input
              type="checkbox"
              checked={row.isSelected}
              onChange={handleSelectChange}
            />
          );
        } 
        else if (column.field === 'data') {
          cellData = 
          <NavLink className="icon-button" to={`/task-scheduler/task-data?taskId=${row['id']}`}>
            <FaMagnifyingGlass/>
          </NavLink>
        } else if (column.field === 'play_pause') {
          cellData = row['isFinished'] || !row['isStarted']? (
            <></>
          ) : (
            row['isPaused'] ? (
              <FaPlay
                className='icon-button'
                onClick={() => onResume(row['id'])}
            /> ) : (
              <FaPause
                className='icon-button'
                onClick={() => onPause(row['id'])}
              />
            )
          );
        } else if (column.field === 'stop') {
          cellData = !row['isFinished'] && row['isStarted'] ? (
            <FaStop
              className='icon-button'
              onClick={() => onStop(row['id'])}
            />
          ) : (<></>);
        } else if (column.field === 'currentStatus' || column.field === 'isEnabled' || column.field === 'isUp') {
          const statusClassName = row[column.field] === 'Active' ? 'status-active' : 'status-inactive';
          cellData = <span className={statusClassName}></span>;
        } else {
          cellData = row[column.field];
        }
        return <td key={`${row.id}-${column.field}`}>{cellData}</td>;
      })}
    </tr>
  );
};