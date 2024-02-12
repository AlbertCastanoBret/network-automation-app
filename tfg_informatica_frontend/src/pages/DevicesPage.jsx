import React, { useEffect, useState } from 'react'
import { Table } from '../components/common/Table'
import { fetchData } from '../utils/fetchData'
import { CountdownTimer } from '../components/common/CountdownTimer';

export const DevicesPage = () => {

  const [devicesData, setDevices] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const apiData = await fetchData('/devices');
      const mappedData = apiData.map((device) => ({
        name: device.hostname,
        status: device.current_status ? 'Active' : 'Inactive',
        ip: device.ip_address,
        vendor: device.vendor,
        os: device.os,
        osVersion: device.os_version ?? 'N/A',
        cpu: device.cpu ?? 'N/A',
        memory: device.memory ?? 'N/A',
      }));
      setDevices(mappedData);
    };

    loadData();

    const intervalId = setInterval(() => {
      loadData();
    }, 10000)

    return () => {
      clearInterval(intervalId);
    }
  }, []);

  const columns = [
    { title: 'Name', field: 'name' },
    { title: 'Status', field: 'status' },
    { title: 'IP Address', field: 'ip' },
    { title: 'Vendor', field: 'vendor' },
    { title: 'OS', field: 'os' },
    { title: 'OS Version', field: 'osVersion' },
    { title: 'CPU%', field: 'cpu'},
    { title: 'Memory%', field: 'memory'}
  ];

  return (
    <div className="devices-page">
      <h1>Devices</h1>
      <CountdownTimer time={10}></CountdownTimer>
      <Table columns={columns} data={devicesData}></Table>
    </div>
  )
}
