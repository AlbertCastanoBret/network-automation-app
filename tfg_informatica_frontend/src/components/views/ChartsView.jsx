import queryString from 'query-string';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom';
import { fetchData } from '../../utils/fetchData';
import { LineChart } from '../deviceData/LineChart';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export const ChartsView = ({activeView}) => {

    const location = useLocation();
    const {deviceId} = queryString.parse(location.search);

    const [responseTimeData, setResponseTimeData] = useState({ labels: [], datasets: [] });
    const [cpuData, setCpuData] = useState({ labels: [], datasets: [] });
    const [memoryData, setMemoryData] = useState({ labels: [], datasets: [] });
    const [statusData, setStatusData] = useState({ labels: [], datasets: [] });

    useEffect(() => {
        if (activeView === 'status') {
            const loadData = async () => {
            const apiData = await fetchData(`/devices/status/${deviceId}`);
            prepareData(apiData);
        };
        loadData();
    
        const intervalId = setInterval(() => {
        loadData();
        }, 10000);
    
        return () => clearInterval(intervalId);
      }
    }, [deviceId, activeView]);

    const prepareData = (data) => {
        const labels = data.map(item => {
            const date = new Date(item.timestamp);
            const userTimezoneOffset = date.getTimezoneOffset() * 60000;
            return new Date(date.getTime() + userTimezoneOffset).toLocaleTimeString();
        });

        const responseTimes = data.map(item => item.response_time);
        const cpuUsages = data.map(item => item.cpu);
        const memoryUsages = data.map(item => item.memory);
        const statusTimes = data.map(item => item.status);

        setResponseTimeData({
            labels: labels,
            datasets: [
                {
                    label: 'Response Time (ms)',
                    data: responseTimes,
                    fill: false,
                    backgroundColor: 'rgb(100, 108, 255)',
                    borderColor: 'rgb(100, 108, 255)',
                }
            ]
        });

        setCpuData({
            labels: labels,
            datasets: [
                {
                    label: 'CPU Usage (%)',
                    data: cpuUsages,
                    fill: false,
                    backgroundColor: 'rgb(100, 108, 255)',
                    borderColor: 'rgb(100, 108, 255)',
                }
            ]
        });

        setMemoryData({
            labels: labels,
            datasets: [
                {
                    label: 'Memory Usage (%)',
                    data: memoryUsages,
                    fill: false,
                    backgroundColor: 'rgb(100, 108, 255)',
                    borderColor: 'rgb(100, 108, 255)',
                }
            ]
        });

        setStatusData({
            labels: labels,
            datasets: [
                {
                    label: 'Status',
                    data: statusTimes,
                    fill: false,
                    backgroundColor: 'rgb(100, 108, 255)',
                    borderColor: 'rgb(100, 108, 255)',
                }
            ]
        });
    }

  return (
    <div className="charts-view view" style={{ display: activeView === 'status' ? 'block' : 'none' }}>
        <h2> Status</h2> 
        <div className="charts-container">
            <LineChart chartData={responseTimeData} title="Response Time" min={1} max={3}></LineChart>
            <LineChart chartData={cpuData} title="CPU Usage" min={0} max={100}></LineChart>
            <LineChart chartData={memoryData} title="Memory Usage" min={0} max={100}></LineChart>
            <LineChart chartData={statusData} title="Status" min={0} max={1} limitTicksToValues={[0, 1]}></LineChart>
        </div>
    </div>
  )
}
