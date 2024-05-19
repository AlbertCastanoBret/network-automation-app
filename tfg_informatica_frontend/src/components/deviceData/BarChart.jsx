import React from 'react';
import { Bar } from 'react-chartjs-2';

export const BarChart = ({ chartData, title, min, max, style}) => {
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
        },
        scales: {
            y: {
                beginAtZero: false,
                suggestedMin: min || 0,
                suggestedMax: max || 100,
            }
        }
    };

    return (
        <div className="chart-device" style={style}>
            <Bar data={chartData} options={options} height={"400px"}/>
        </div>
    );
};
