import queryString from 'query-string';
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { fetchData } from '../../utils/fetchData';
import { Table } from '../common/Table';
import Modal from 'react-modal';

export const ConfigHistoryView = ({ activeView }) => {
  const [configHistoryData, setConfigHistoryData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();
  const { deviceId } = queryString.parse(location.search);
  const controllerRef = useRef(null);

  const saveCurrentConfig = useCallback(async () => {
    try {
      await fetch(`${import.meta.env.VITE_BACKEND_URL}/devices/backup/${deviceId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error("Failed to save current configuration:", error);
    }
  }, [deviceId]);

  const loadData = useCallback(async () => {
    if (isLoading) return;
    controllerRef.current = new AbortController();
    const signal = controllerRef.current.signal;

    try {
      const apiData = await fetchData(`/devices/backup/${deviceId}`, { signal });
      const mappedData = apiData.map((backup) => ({
        id: backup.id,
        date: backup.timestamp,
        configuration: backup.config ?? 'N/A',
      }));
      setConfigHistoryData(mappedData);

      if (mappedData.length === 0) {
        await saveCurrentConfig();
        await refreshConfigHistory();
      } else {
        const lastBackup = mappedData[mappedData.length - 1];
        const compareConfig = await fetchData(`/devices/compare/${deviceId}/${lastBackup.id}`, { signal });
        const diff = compareConfig.diff ?? '';

        if (diff !== '') {
          await saveCurrentConfig();
          await refreshConfigHistory();
        }
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Fetch aborted');
      } else {
        console.error("Failed to fetch device data:", error);
      }
    }
  }, [deviceId, saveCurrentConfig, isLoading]);

  const refreshConfigHistory = useCallback(async () => {
    if (controllerRef.current) {
      controllerRef.current.abort();
    }
    controllerRef.current = new AbortController();
    const signal = controllerRef.current.signal;

    try {
      const updatedApiData = await fetchData(`/devices/backup/${deviceId}`, { signal });
      const updatedMappedData = updatedApiData.map((backup) => ({
        id: backup.id,
        date: backup.timestamp,
        configuration: backup.config ?? 'N/A',
      }));
      setConfigHistoryData(updatedMappedData);
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Fetch aborted');
      } else {
        console.error("Failed to refresh configuration history:", error);
      }
    }
  }, [deviceId]);

  const onRestore = (config) => {
    setSelectedConfig(config);
    setIsModalOpen(true);
  };

  const handleConfirmRestore = async () => {
    setIsLoading(true);
    if (controllerRef.current) {
      controllerRef.current.abort();
    }

    if (selectedConfig) {
      try {
        await fetch(`${import.meta.env.VITE_BACKEND_URL}/devices/restore/${deviceId}/${selectedConfig.id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const updatedData = configHistoryData.filter(backup => new Date(backup.date) <= new Date(selectedConfig.date));
        const leftoverData = configHistoryData.filter(backup => new Date(backup.date) > new Date(selectedConfig.date));

        setConfigHistoryData(updatedData);

        if (leftoverData.length > 0) {
          await fetch(`${import.meta.env.VITE_BACKEND_URL}/devices/backup/${deviceId}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ backups: leftoverData.map(backup => backup.id) }),
          });
        }
      } catch (error) {
        console.error("Failed to restore configuration:", error);
      }
    }
    setIsLoading(false);
    setIsModalOpen(false);
  };

  const handleCancelRestore = () => {
    setIsModalOpen(false);
    setSelectedConfig(null);
  };

  useEffect(() => {
    if (activeView === 'config-history' && !isLoading) {
      loadData();

      const intervalId = setInterval(loadData, 20000);
      return () => clearInterval(intervalId);
    }
  }, [activeView, loadData, isLoading]);

  const columns = [
    { title: 'Date', field: 'date' },
    { title: 'Restore', field: 'restore' },
  ];

  const customStyles = {
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
    },
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: '#282c34',
      color: '#fff', 
      padding: '20px', 
      borderRadius: '8px', 
      border: '1px solid #9ca1fc', 
    },
  };

  return (
    <div className="config-history-view view" style={{ display: activeView === 'config-history' ? 'block' : 'none' }}>
      <h2>Configuration History</h2>
      <Table columns={columns} data={configHistoryData} onRestore={onRestore} />
      <Modal
        isOpen={isModalOpen}
        onRequestClose={handleCancelRestore}
        contentLabel="Confirm Restore"
        style={customStyles}
        shouldCloseOnOverlayClick={false}
        shouldCloseOnEsc={false}
      >
        <strong
          style={
            {fontSize: '18px', color: '#9ca1fc'}
         }>Confirm Restore</strong>
        <p
          style={
          {fontSize: '16px',}}>Are you sure you want to restore this configuration?</p>
        <button 
          style={
            {padding: '8px 16px', marginRight: '10px'}}
          onClick={handleConfirmRestore} disabled={isLoading}>Yes</button>
        <button 
          style={
            {padding: '8px 16px', marginRight: '10px'}}
          onClick={handleCancelRestore} disabled={isLoading}>No</button>
      </Modal>
    </div>
  );
};
