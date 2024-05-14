import queryString from 'query-string';
import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom';
import { fetchData } from '../../utils/fetchData';

export const FactsView = ({activeView}) => {

  const [deviceData, setDevice] = useState([]);
  const location = useLocation();
    const {deviceId} = queryString.parse(location.search);

  useEffect(() => {
    const loadData = async () => {
      try {
        const apiData = await fetchData(`/devices/${deviceId}`);
        setDevice({
          fqdn: apiData.fqdn ?? 'N/A',
          hostname: apiData.hostname ?? 'N/A',
          model: apiData.model ?? 'N/A',
          os_version: apiData.os_version ?? 'N/A',
          serial_number: apiData.serial_number ?? 'N/A',
          vendor: apiData.vendor ?? 'N/A',
          uptime: apiData.uptime ?? 'N/A'
        });
      } catch (error) {
        console.error("Failed to fetch device data:", error);
        setDevice({
          fqdn: 'N/A',
          hostname: 'N/A',
          model: 'N/A',
          os_version: 'N/A',
          serial_number: 'N/A',
          vendor: 'N/A',
          uptime: 'N/A'
        });
      }
    };

    loadData();

    const intervalId = setInterval(() => {
      loadData();
    }, 10000)

    return () => {
      clearInterval(intervalId);
    }
  }, []);

  return (
    <div className="facts-view" style={{ display: activeView === 'facts' ? 'block' : 'none' }}>
      <h2>Facts</h2>
      <div className="facts-row">
        <strong>FQDN</strong>
        <p>{deviceData.fqdn || 'Loading...'}</p>
      </div>
      <div className="facts-row">
        <strong>Hostname</strong>
        <p>{deviceData.hostname || 'Loading...'}</p>
      </div>
      <div className="facts-row">
        <strong>Model</strong>
        <p>{deviceData.model || 'Loading...'}</p>
      </div>
      <div className="facts-row">
        <strong>OS Version</strong>
        <p>{deviceData.os_version || 'Loading...'}</p>
      </div>
      <div className="facts-row">
        <strong>Serial</strong>
        <p>{deviceData.serial_number || 'Loading...'}</p>
      </div>
      <div className="facts-row">
        <strong>Vendor</strong>
        <p>{deviceData.vendor || 'Loading...'}</p>
      </div>
      <div className="facts-row">
        <strong>Uptime</strong>
        <p>{deviceData.uptime || 'Loading...'}</p>
      </div>
    </div>
  )
}
