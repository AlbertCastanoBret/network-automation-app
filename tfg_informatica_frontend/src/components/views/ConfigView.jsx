import queryString from 'query-string';
import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom';
import { fetchData } from '../../utils/fetchData';

export const ConfigView = ({activeView}) => {

    const [deviceData, setDevice] = useState([]);
    const location = useLocation();
    const {deviceId} = queryString.parse(location.search);

    useEffect(() => {
        if (activeView === 'config') {
        const loadData = async () => {
            try {
            const apiData = await fetchData(`/devices/${deviceId}`);
            setDevice({
                currentConfiguration: apiData.current_configuration ?? 'N/A',
            });
            } catch (error) {
            console.error("Failed to fetch device data:", error);
            setDevice({
                currentConfiguration: 'N/A',
            });
            }
        };
    
        loadData();
    
        const intervalId = setInterval(loadData, 10000);
        return () => clearInterval(intervalId);
        }
    }, [deviceId, activeView]);

  return (
    <div className="config-view view" style={{ display: activeView === 'config' ? 'block' : 'none' }}>
      <h2>Configuration</h2>
        <div className="config-row">
            <strong>Current Configuration</strong>
            <p style={{ whiteSpace: 'pre-wrap' }}>
                {deviceData.currentConfiguration || 'Loading...'}
            </p>
        </div>
    </div>
  )
}
