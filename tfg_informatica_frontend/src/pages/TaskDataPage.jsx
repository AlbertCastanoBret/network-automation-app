import queryString from 'query-string';
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { fetchData } from '../utils/fetchData';

export const TaskDataPage = () => {
  const location = useLocation();
  const { taskId } = queryString.parse(location.search);
  const [taskData, setTaskData] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const apiData = await fetchData(`/task-scheduler/${taskId}`);
        setTaskData({
          id: apiData.id ?? 'N/A',
          name: apiData.name ?? 'N/A',
          deviceId: apiData.device_id ?? 'N/A',
          executionTime: apiData.execution_time ?? 'N/A',
          repeatInterval: apiData.repeat_interval ?? 'N/A',
          daysOfWeek: apiData.days_of_week ?? 'N/A',
          lastExecutionTime: apiData.last_execution_time ?? 'N/A',
          results: apiData.results ?? 'N/A'
        });
      } catch (error) {
        console.error("Failed to fetch task data:", error);
        setError('Failed to fetch task data');
        setTaskData({
          id: 'N/A',
          name: 'N/A',
          deviceId: 'N/A',
          executionTime: 'N/A',
          repeatInterval: 'N/A',
          daysOfWeek: 'N/A',
          lastExecutionTime: 'N/A',
          results: 'N/A'
        });
      }
    };
    loadData();

    const intervalId = setInterval(() => {
      loadData();
    }, 10000);

    return () => {
      clearInterval(intervalId);
    };
  }, [taskId]);

  const renderResults = () => {
    if (taskData.results === 'N/A') {
      return <pre>No results available</pre>;
    }

    try {
      const results = JSON.parse(taskData.results.replace(/'/g, '"'));
      return Object.entries(results).map(([cmd, output]) => (
        <div key={cmd}>
          <span className="terminal-command">{`Command: ${cmd}`}</span>
          <pre>{output}</pre>
        </div>
      ));
    } catch (e) {
      return <pre>{taskData.results}</pre>;
    }
  };

  return (
    <div className="task-results-page">
      <h1>Task Data</h1>
      <div className="results-row">
        <strong>ID: </strong>
        <p>{taskData.id || 'Loading...'}</p>
      </div>
      <div className="results-row">
        <strong>Name: </strong>
        <p>{taskData.name || 'Loading...'}</p>
      </div>
      <div className="results-row">
        <strong>Device ID: </strong>
        <p>{taskData.deviceId || 'Loading...'}</p>
      </div>
      <div className="results-row">
        <strong>Execution Time: </strong>
        <p>{taskData.executionTime || 'Loading...'}</p>
      </div>
      <div className="results-row">
        <strong>Day Interval (Minutes): </strong>
        <p>{taskData.repeatInterval || 'Loading...'}</p>
      </div>
      <div className="results-row">
        <strong>Week Interval: </strong>
        <p>{taskData.daysOfWeek || 'Loading...'}</p>
      </div>
      <div className="results-row">
        <strong>Last Execution Time: </strong>
        <p>{taskData.lastExecutionTime || 'Loading...'}</p>
      </div>
      <div className="terminal-screen">
        {taskData.results ? renderResults() : 'Loading results...'}
      </div>
      {error && <pre className="error">{error}</pre>}
    </div>
  );
};
