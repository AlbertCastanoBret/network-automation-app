import React, { useEffect, useState } from 'react'
import { Table } from '../components/common/Table'
import { fetchData } from '../utils/fetchData'
import { CountdownTimer } from '../components/common/CountdownTimer';

export const HostsPage = () => {
    const [devicesData, setDevices] = useState([]);

    useEffect(() => {
      const loadData = async () => {
        const apiData = await fetchData('/hosts');
        const mappedData = apiData.map((host) => ({
          name: host.name,
          //status: device.current_status ? 'Active' : 'Inactive',
          ip: host.ip_address,
          mac: host.mac_address
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
      { title: 'IP Address', field: 'ip' },
      { title: 'MAC Address', field: 'mac' },
    ];
  
    return (
      <div className="hosts-page">
        <h1>Hosts</h1>
        <CountdownTimer time={10}></CountdownTimer>
        <Table columns={columns} data={devicesData}></Table>
      </div>
    )
}
