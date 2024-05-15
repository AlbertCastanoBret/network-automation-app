import React, { useState } from 'react'
import { TableRow } from './TableRow';

export const Table = ({ columns, data, additionalClassName, secondaryColumns=[]}) => {
  const [expandedRows, setExpandedRows] = useState([]);

    const handleRowToggle = (index) => {
        setExpandedRows((prevExpandedRows) => 
            prevExpandedRows.includes(index)
                ? prevExpandedRows.filter((rowIndex) => rowIndex !== index)
                : [...prevExpandedRows, index]
        );
    };


    return (
    <div className="table-container">
      <table className={`table ${additionalClassName}`}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.field}>{column.title}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <React.Fragment key={index}>
              <TableRow 
                row={row} 
                columns={columns} 
                index={index} 
                isExpanded={expandedRows.includes(index)} 
                onToggle={() => handleRowToggle(index)} />
              {expandedRows.includes(index) && (
                <tr>
                  <td colSpan={columns.length} style={
                    {padding: 0,
                    backgroundColor: '#58596b',
                  borderRadius: '0 0 4px 4px'}
                  }>
                    <Table columns={secondaryColumns} data={[row]} additionalClassName={"secondary-table"}
                    ></Table>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
    );
};
