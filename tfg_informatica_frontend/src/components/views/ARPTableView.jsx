import queryString from 'query-string';
import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom';
import { fetchData } from '../../utils/fetchData';
import { Table } from '../common/Table';

export const ARPTableView = ({activeView}) => {

    const [arpTableData, setArpTableData] = useState([]);
    const location = useLocation();
    const {deviceId} = queryString.parse(location.search);

    useEffect(() => {
        if (activeView === 'arp-table') {
            const loadData = async () => {
            const apiData = await fetchData(`/devices/device_arp_table/${deviceId}`);
            const mappedData = apiData.map((arpRow) => ({
                ip_address: arpRow.ip_address ?? 'N/A',
                mac_address: arpRow.mac_address ?? 'N/A',
                interface: arpRow.interface ?? 'N/A'
            }));
            setArpTableData(mappedData);
        };
        loadData();
        
        const intervalId = setInterval(() => {
            loadData();
        }, 10000);
        
        return () => clearInterval(intervalId);
        }
    }, [deviceId, activeView]);

    const columns = [
        { title: 'IP Address', field: 'ip_address'},
        { title: 'MAC Address', field: 'mac_address' },
        { title: 'Interface', field: 'interface' },
    ];

  return (
    <div className="arp-table-view view" style={{ display: activeView === 'arp-table' ? 'block' : 'none' }}>
        <h2>ARP Table</h2>
        <Table columns={columns} data={arpTableData}></Table>
    </div>
  )
}
