import React from 'react'
import { FaAngleRight, FaChartSimple, FaGear } from 'react-icons/fa6';
import { NavLink } from 'react-router-dom';

export const TableRow = ({ row, columns, index, isExpanded, onToggle}) => {
    return (
        <tr>
            {columns.map((column) => {
                let cellData;
                if (column.field === 'actions'){
                  cellData = 
                  <div>
                    <NavLink className= "icon-button" to={`/devices/device-data?deviceId=${index+1}`}>
                      <FaChartSimple></FaChartSimple>
                    </NavLink>
                    <NavLink className= "icon-button" to={`/devices/device-configuration?deviceId=${index+1}`}>
                      <FaGear></FaGear>
                    </NavLink></div>
                }
                else if (column.field === 'arrowButton') {
                  cellData = <FaAngleRight
                    className={`arrow-button ${isExpanded ? 'expanded' : ''}`}
                    onClick={onToggle}
                  />
                }
                else if (column.field === 'currentStatus' || column.field === 'isEnabled' || column.field === 'isUp') {
                  const statusClassName = row[column.field] == 'Active' ? 'status-active' : 'status-inactive';
                  cellData = <span className={statusClassName}></span>;
                } else {
                  cellData = row[column.field];
                }
                return <td key={`${row.id}-${column.field}`}>{cellData}</td>;
            })}
        </tr>
    );
};
