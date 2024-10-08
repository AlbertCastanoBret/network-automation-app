import React from 'react'
import { Pie } from 'react-chartjs-2';

export const PieChart = ({ chartData, title}) => {
    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'bottom',
            },
            title: {
                display: true,
                text: title,
                font: {
                    size: 18,
                },
                color: 'rgb(255, 255, 255)',
            }
        }
    };
    
  return (
    <Pie className='chart-device' data={chartData} options={options}></Pie>
  )
}
