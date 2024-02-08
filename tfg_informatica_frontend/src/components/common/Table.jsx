import React from 'react'
import { TableRow } from './TableRow';

export const Table = ({ columns, data}) => {
    return (
        <table className='table'>
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.field}>{column.title}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <TableRow key={index} row={row} columns={columns} index={index}/>
            ))}
          </tbody>
        </table>
    );
};
