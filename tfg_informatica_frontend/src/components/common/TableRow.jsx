import React from 'react'
import { FaChartSimple } from 'react-icons/fa6';
import { NavLink } from 'react-router-dom';

export const TableRow = ({ row, columns, index, data}) => {
    return (
        <tr>
            {columns.map((column) => {
                let cellData;
                if (column.field === 'actions'){
                  cellData = <NavLink className= "icon-button" to={`/devices/device-data?deviceId=${index+1}`}>
                              <FaChartSimple></FaChartSimple>
                            </NavLink>
                }
                else if (column.field === 'status') {
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
