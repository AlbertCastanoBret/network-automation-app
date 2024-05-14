import React from 'react'
import { Line } from 'react-chartjs-2';

export const Chart = ({ chartData, title, min, max, limitTicksToValues }) => {
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
                size: 16,
            },
            color: 'rgb(255, 255, 255)',
        }
    },
    scales: {
        y: {
            beginAtZero: false,
            ticks: {
              callback: limitTicksToValues ? function(value, index, values) {
                return limitTicksToValues.includes(value) ? value : '';
              } : undefined,
            },
            suggestedMin: min,
            suggestedMax: max,
        }
    }
};

return (
    <Line className='chart-device' data={chartData} options={options}/>
);
}
