import React from 'react'

export const TableRow = ({ row, columns, index}) => {
    return (
        <tr>
            {columns.map((column) => {
                let cellData;
                if (column.field === 'status') {
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
