import React, { useEffect, useState } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { fetchData } from '../utils/fetchData';
import { useLocation } from 'react-router-dom';
import queryString from 'query-string';
import { Chart } from '../components/deviceData/Chart';
import { FactsView } from '../components/views/FactsView';
import { ChartsView } from '../components/views/ChartsView';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const DeviceDataPage = () => {

    const location = useLocation();
    const {deviceId} = queryString.parse(location.search);

    const [activeView, setActiveView] = useState('status');

    const [responseTimeData, setResponseTimeData] = useState({ labels: [], datasets: [] });
    const [cpuData, setCpuData] = useState({ labels: [], datasets: [] });
    const [memoryData, setMemoryData] = useState({ labels: [], datasets: [] });
    const [statusData, setStatusData] = useState({ labels: [], datasets: [] });

    useEffect(() => {
        const loadData = async () => {
            const apiData = await fetchData(`/devices/device_status/${deviceId}`);
            prepareData(apiData);
        }
        loadData();

        const intervalId = setInterval(() => {
            loadData();
          }, 10000)
      
          return () => {
            clearInterval(intervalId);
        }

    }, [deviceId]);


    const prepareData = (data) => {
        data.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

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
        <div className='device-data-page'>
            <h1>Device Data</h1>
            <div className="device-data-container">
                <div className="options-container">
                    <button className="button" onClick={() => setActiveView('status')}>Status</button>
                    <button className="button" onClick={() => setActiveView('facts')}>Facts</button>
                </div>
                <ChartsView activeView={activeView}></ChartsView>
                <FactsView activeView={activeView}></FactsView>
            </div>
        </div>
    );
};

export default DeviceDataPage;