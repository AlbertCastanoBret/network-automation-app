import queryString from 'query-string';
import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom';
import { fetchData } from '../../utils/fetchData';
import { Table } from '../common/Table';

export const InterfacesTableView = ({activeView}) => {

    const [interfacesTableData, setInterfacesTableData] = useState([]);
    const location = useLocation();
    const {deviceId} = queryString.parse(location.search);

    useEffect(() => {
        if (activeView === 'interfaces-table') {
            const loadData = async () => {
            const apiData = await fetchData(`/devices/device_interfaces/${deviceId}`);
            const mappedData = apiData.map((interfaceRow) => ({
                interfaceName: interfaceRow.interface_name ?? 'N/A',
                isEnabled: interfaceRow.is_enabled ? 'Active' : 'Inactive',
                isUp: interfaceRow.is_up ? 'Active' : 'Inactive',
                speed: interfaceRow.speed ?? 'N/A',
                tx_errors: interfaceRow.tx_errors ?? 'N/A',
                rx_errors: interfaceRow.rx_errors ?? 'N/A',
                tx_discards: interfaceRow.tx_discards ?? 'N/A',
                rx_discards: interfaceRow.rx_discards ?? 'N/A',
                tx_octets: interfaceRow.tx_octets ?? 'N/A',
                rx_octets: interfaceRow.rx_octets ?? 'N/A',
                tx_unicast_packets: interfaceRow.tx_unicast_packets ?? 'N/A',   
                rx_unicast_packets: interfaceRow.rx_unicast_packets ?? 'N/A',
            }));
            setInterfacesTableData(mappedData);
        };
        loadData();
        
        const intervalId = setInterval(() => {
            loadData();
        }, 10000);
        
        return () => clearInterval(intervalId);
        }
    }, [deviceId, activeView]);

    const columns = [
        { title: '', field: 'arrowButton'},
        { title: 'Interface Name', field: 'interfaceName'},
        { title: 'Physical Status', field: 'isEnabled' },
        { title: 'Operational Status', field: 'isUp' },
        { title: 'Speed', field: 'speed' },
    ];

    const secondaryColumns = [
        { title: 'TX Errors', field: 'tx_errors'},
        { title: 'RX Errors', field: 'rx_errors' },
        { title: 'TX Discards', field: 'tx_discards' },
        { title: 'RX Discards', field: 'rx_discards' },
        { title: 'TX Octets', field: 'tx_octets' },
        { title: 'RX Octets', field: 'rx_octets' },
        { title: 'TX Unicast Packets', field: 'tx_unicast_packets' },
        { title: 'RX Unicast Packets', field: 'rx_unicast_packets' },
    ];


  return (
    <div className="interfaces-table-view view" style={{ display: activeView === 'interfaces-table' ? 'block' : 'none' }}>
        <h2>Interfaces</h2>
        <Table columns={columns} data={interfacesTableData} secondaryColumns={secondaryColumns}></Table>
    </div>
  )
}
