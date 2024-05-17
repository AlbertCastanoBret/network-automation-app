import React, { useEffect, useState } from 'react';
import { fetchData } from '../utils/fetchData';
import { Table } from '../components/common/Table';

export const TaskEdit = () => {

  const [name, setName] = useState('')
  const [commands, setCommands] = useState('');
  const [time, setTime] = useState('');
  const [repeat, setRepeat] = useState(false);
  const [repeatInterval, setRepeatInterval] = useState('');
  const [customInterval, setCustomInterval] = useState('');
  const [weekRepeat, setWeekRepeat] = useState(false);
  const [weekRepeatInterval, setWeekRepeatInterval] = useState('once');
  const [customDays, setCustomDays] = useState([]);
  const [devicesData, setDevices] = useState([]);
  const [selectedDevices, setSelectedDevices] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const apiData = await fetchData('/devices');
      const mappedData = apiData.map((device) => ({
        id: device.id,
        name: device.hostname,
        ip: device.ip_address,
      }));
      setDevices(mappedData);
    };

    loadData();
  }, []);

  const columns = [
    { title: 'Name', field: 'name' },
    { title: 'IP Address', field: 'ip' },
    { title: 'Selection', field: 'select'}
  ];

  const handleNameChange = (e) => {
    setName(e.target.value);
  };

  const handleCommandsChange = (e) => {
    setCommands(e.target.value);
  };

  const handleTimeChange = (e) => {
    setTime(e.target.value);
  };

  const handleRepeatChange = (e) => {
    setRepeat(e.target.checked);
    if (e.target.checked == true) {
      setRepeatInterval('30 minutes');
    }
    else {
      setRepeatInterval('');
      setCustomInterval('');
    }
  };

  const handleRepeatIntervalChange = (e) => {
    setRepeatInterval(e.target.value);
    if (e.target.value !== 'custom') {
      setCustomInterval('');
    }
  };

  const handleCustomIntervalChange = (e) => {
    setCustomInterval(e.target.value);
  };

  const handleWeekRepeatChange = (e) => {
    setWeekRepeat(e.target.checked);
    if (e.target.checked === true) {
      setWeekRepeatInterval('daily');
      setCustomDays([]);
    }
    else {
      setWeekRepeatInterval('');
      setCustomDays([]);
    }
  };

  const handleWeekRepeatIntervalChange = (e) => {
    setWeekRepeatInterval(e.target.value);
    if (e.target.value !== 'custom') {
      setCustomDays([]);
    }
  };

  const handleCustomDaysChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setCustomDays([...customDays, value]);
    } else {
      setCustomDays(customDays.filter(day => day !== value));
    }
  };

  const handleDeviceSelection = (e, id) => {
    const { checked } = e.target;
    setDevices(devicesData.map(device => 
      device.id === id ? { ...device, isSelected: checked } : device
    ));
    if (checked) {
      setSelectedDevices([...selectedDevices, id]);
    } else {
      setSelectedDevices(selectedDevices.filter(deviceId => deviceId !== id));
    }
  };

  return (
    <div className="task-edit-page">
      <h1>Task</h1>
      <h2>Configuration</h2>
      <div className="input-task-container">
        <strong htmlFor="name" className='input-task-label'>Name:</strong>
        <input 
          type="text" 
          className="terminal-input" 
          placeholder="Enter task name" 
          value={name}
          onChange={handleNameChange}
        />
      </div>
      <div className="input-task-container">
        <strong htmlFor="commands" className='input-task-label'>Commands:</strong>
        <input 
          type="text" 
          className="terminal-input" 
          placeholder="Enter CLI commands separated by comma and space" 
          value={commands}
          onChange={handleCommandsChange}
        />
      </div>
      <div className="input-task-container">
        <strong htmlFor="time" className='input-task-label'>Time:</strong>
        <input 
          type="time" 
          id="time" 
          name="time" 
          value={time}
          onChange={handleTimeChange}
          className="terminal-input" 
          style={{width: '16%', fontSize: '18px', minWidth: '100px', maxWidth: '152px'}}
        />
      </div>
      <h2 style={{marginTop: '40px'}}>Day Interval</h2>
      <div className="input-task-container">
        <strong htmlFor="repeat" className='input-task-label'>Repeat:</strong>
        <input 
          type="checkbox" 
          id="repeat" 
          name="repeat" 
          checked={repeat}
          onChange={handleRepeatChange}
          className="" 
          style={{width: 'auto'}}
        />
      </div>
      {repeat && (
        <div className="input-task-container">
          <strong htmlFor="repeatInterval" className='input-task-label'>Interval:</strong>
          <select 
            id="repeatInterval" 
            name="repeatInterval" 
            value={repeatInterval}
            onChange={handleRepeatIntervalChange}
            className="terminal-input" 
            style={{width: 'auto', fontSize: '18px', minWidth: '110px', maxWidth: '180px'}}
          >
            <option value="30 minutes">Every 30 minutes</option>
            <option value="1 hour">Every hour</option>
            <option value="2 hours">Every 2 hours</option>
            <option value="3 hours">Every 3 hours</option>
            <option value="custom">Custom</option>
          </select>
        </div>
      )}
      {repeat && repeatInterval === 'custom' && (
        <div className="input-task-container">
          <strong htmlFor="customInterval" className='input-task-label'>Custom (minutes):</strong>
          <input 
            type="number" 
            id="customInterval" 
            name="customInterval" 
            min="1"
            value={customInterval}
            onChange={handleCustomIntervalChange}
            className="terminal-input"
            style={{width: '16%', fontSize: '18px', minWidth: '100px', maxWidth: '152px'}}
          />
        </div>
      )}
      <h2 style={{marginTop: '40px'}}>Week Interval</h2>
      <div className="input-task-container">
        <strong htmlFor="weekRepeat" className='input-task-label'>Repeat:</strong>
        <input 
          type="checkbox" 
          id="weekRepeat" 
          name="weekRepeat" 
          checked={weekRepeat}
          onChange={handleWeekRepeatChange}
          className="" 
          style={{width: 'auto'}}
        />
      </div>
      {weekRepeat && (
        <div className="input-task-container">
          <strong htmlFor="weekRepeatInterval" className='input-task-label'>Interval:</strong>
          <select 
            id="weekRepeatInterval" 
            name="weekRepeatInterval" 
            value={weekRepeatInterval}
            onChange={handleWeekRepeatIntervalChange}
            className="terminal-input" 
            style={{width: 'auto', fontSize: '18px', minWidth: '110px', maxWidth: '180px'}}
          >
            <option value="daily">Daily</option>
            <option value="weekdays">Mon to Fri</option>
            <option value="custom">Custom</option>
          </select>
        </div>
      )}
      {weekRepeat && weekRepeatInterval === 'custom' && (
        <div className="input-task-container">
          <strong className='input-task-label' style={{alignSelf: 'start'}}>Custom Days:</strong>
          <div className="custom-days" style={{fontSize: '18px'}}>
            {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
              <label key={day} >
                <input 
                  type="checkbox" 
                  value={day} 
                  checked={customDays.includes(day)}
                  onChange={handleCustomDaysChange}
                  className=""
                />
                {day}
              </label>
            ))}
          </div>
        </div>
      )}
      <h2 style={{marginTop: '40px'}}>Devices</h2>
      <Table columns={columns} data={devicesData} onSelect={handleDeviceSelection}></Table>
      <button onClick={() => console.log('Save Task')} style={{padding: '8px 16px', marginTop: '20px'}}>Save Task</button>
    </div>
  );
};