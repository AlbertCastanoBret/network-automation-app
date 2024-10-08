import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { PieChart } from '../components/deviceData/PieChart';
import { BarChart } from '../components/deviceData/BarChart';
import { fetchData } from '../utils/fetchData';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, BarElement, Title, Tooltip, Legend);

export const HomePage = () => {
  const [devicesData, setDevicesData] = useState({
    labels: ['Active', 'Inactive'],
    datasets: [
      {
        label: 'Devices',
        data: [0, 0],
        backgroundColor: ['#646cff', '#333'],
        borderColor: ['#9ca1fc', '#c6c9ff'],
        borderWidth: 0.5,
      },
    ],
  });
  const [cpuMemoryData, setCpuMemoryData] = useState({
    labels: ['CPU Usage', 'Memory Usage(%)'],
    datasets: [
      {
        label: 'Average',
        data: [0, 0],
        backgroundColor: ['#646cff', '#333'],
          borderColor: ['#9ca1fc', '#c6c9ff'],
        borderWidth: 0.5,
      },
    ],
  });
  const [responseTimeData, setResponseTimeData] = useState({
    labels: ['Response Time'],
    datasets: [
      {
        label: 'Average',
        data: [0],
        backgroundColor: ['#646cff'],
          borderColor: ['#9ca1fc'],
        borderWidth: 0.5,
      },
    ],
  });
  const [tasksData, setTasksData] = useState({
    labels: ['Active', 'Finished', 'Scheduled'],
    datasets: [
      {
        label: 'Tasks',
        data: [0, 0, 0],
        backgroundColor: ['#646cff', '#333', '#9ca1fc'],
        borderColor: ['#9ca1fc', '#c6c9ff', '#ffffff'],
        borderWidth: 0.5,
      },
    ],
  });

  useEffect(() => {
    const loadData = async () => {
      const apiData = await fetchData('/devices');
      const mappedData = apiData.map((device) => ({
        currentStatus: device.current_status ? 'Active' : 'Inactive',
      }));
      prepareData(mappedData);

      const apiData2 = await fetchData('/devices/status');
      const mappedData2 = apiData2.map((status) => ({
        status: status.status,
        cpu: parseFloat(status.cpu),
        memory: parseFloat(status.memory),
        responseTime: status.response_time,
      }));
      prepareBarChartData(mappedData2);
      prepareResponseTimeChartData(mappedData2);

      const apiData3 = await fetchData('/task-scheduler');
      const mappedData3 = apiData3.map((task) => ({
        isStarted: task.is_started,
        isFinished: task.is_finished,
      }));
      prepareTasksData(mappedData3);
    };

    loadData();

    const intervalId = setInterval(() => {
      loadData();
    }, 10000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  const prepareData = (data) => {
    const statusCount = data.reduce(
      (acc, device) => {
        acc[device.currentStatus === 'Active' ? 0 : 1]++;
        return acc;
      },
      [0, 0]
    );

    setDevicesData({
      labels: ['Active', 'Inactive'],
      datasets: [
        {
          label: 'Devices',
          data: statusCount,
          backgroundColor: ['#646cff', '#333'],
          borderColor: ['#9ca1fc', '#c6c9ff'],
          borderWidth: 0.5,
        },
      ],
    });
  };

  const prepareBarChartData = (data) => {
    const totalDevices = data.length;
    const avgCpu = data.reduce((acc, status) => acc + status.cpu, 0) / totalDevices;
    const avgMemory = data.reduce((acc, status) => acc + status.memory, 0) / totalDevices;

    setCpuMemoryData({
      labels: ['CPU Usage(%)', 'Memory Usage(%)'],
      datasets: [
        {
          label: 'Average',
          data: [avgCpu, avgMemory],
          backgroundColor: ['#646cff', '#333'],
          borderColor: ['#9ca1fc', '#c6c9ff'],
          borderWidth: 0.5,
        },
      ],
    });
  };

  const prepareResponseTimeChartData = (data) => {
    const totalDevices = data.length;
    const avgResponseTime = data.reduce((acc, status) => acc + status.responseTime, 0) / totalDevices;

    setResponseTimeData({
      labels: ['Response Time'],
      datasets: [
        {
          label: 'Average',
          data: [avgResponseTime],
          backgroundColor: ['#646cff'],
          borderColor: ['#9ca1fc'],
          borderWidth: 0.5,
        },
      ],
    });
  };

  const prepareTasksData = (data) => {
    const activeTasks = data.filter((task) => task.isStarted && !task.isFinished).length;
    const finishedTasks = data.filter((task) => task.isFinished).length;
    const scheduledTasks = data.filter((task) => !task.isStarted && !task.isFinished).length;

    setTasksData({
      labels: ['Active', 'Finished', 'Scheduled'],
      datasets: [
        {
          label: 'Tasks',
          data: [activeTasks, finishedTasks, scheduledTasks],
          backgroundColor: ['#646cff', '#333', '#9ca1fc'],
          borderColor: ['#9ca1fc', '#c6c9ff', '#ffffff'],
          borderWidth: 0.5,
        },
      ],
    });
  }

  return (
    <>
      <div className="home-page">
        <h1>Dashboard</h1>
        <div className="charts-container">
            <PieChart chartData={devicesData} title="Devices Status" />
            <BarChart chartData={cpuMemoryData} title="Average CPU and Memory Usage" style={{marginTop: '40px', display: "flex", justifyContent: "center"}}/>
            <BarChart chartData={responseTimeData} title="Average Response Time"  min={0} max={5} style={{marginTop: '40px', display: "flex", justifyContent: "center"}}/>
            <PieChart chartData={tasksData} title="Task Scheduler" />
        </div>
      </div>
    </>
  );
};
