import queryString from 'query-string';
import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom';
import { fetchData } from '../../utils/fetchData';
import { Table } from '../common/Table';

export const BGPNeighborsView = ({activeView}) => {

    const [bgpNeighborsTableData, setBgpNeighborsTableData] = useState([]);
    const location = useLocation();
    const {deviceId} = queryString.parse(location.search);

    useEffect(() => {
        if (activeView === 'bgp-neighbors-table') {
            const loadData = async () => {
            const apiData = await fetchData(`/devices/bgp_neighbors/${deviceId}`);
            const mappedData = apiData.map((bgpNeighborsRow) => ({
                neighborAdress: bgpNeighborsRow.neighbor_address ?? 'N/A',
                isEnabled: bgpNeighborsRow.is_enabled ? 'Active' : 'Disabled',
                isUp: bgpNeighborsRow.is_up ? 'Active' : 'Disabled',
                localAs: bgpNeighborsRow.local_as ?? 'N/A',
                remoteAs: bgpNeighborsRow.remote_as ?? 'N/A',
                remoteId: bgpNeighborsRow.remote_id ?? 'N/A',
                uptime: bgpNeighborsRow.uptime ?? 'N/A',
                sentPrefixesIpV4: bgpNeighborsRow.sent_prefixes_ipv4 ?? 'N/A',
                acceptedPrefixesIpV4: bgpNeighborsRow.accepted_prefixes_ipv4 ?? 'N/A',
                receivedPrefixesIpV4: bgpNeighborsRow.received_prefixes_ipv4 ?? 'N/A',
                sentPrefixesIpV6: bgpNeighborsRow.sent_prefixes_ipv6 ?? 'N/A',
                acceptedPrefixesIpV6: bgpNeighborsRow.accepted_prefixes_ipv6 ?? 'N/A',
                receivedPrefixesIpV6: bgpNeighborsRow.received_prefixes_ipv6 ?? 'N/A',
            }));
            setBgpNeighborsTableData(mappedData);
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
        { title: 'Neighbor Address', field: 'neighborAdress'},
        { title: 'Operational Status', field: 'isUp' },
        { title: 'Administrative Status', field: 'isEnabled' },
        { title: 'Local AS', field: 'localAs' },
        { title: 'Remote AS', field: 'remoteAs' },
        { title: 'Remote ID', field: 'remoteId' },
        { title: 'Uptime', field: 'uptime' },
    ];
    
    const secondaryColumns = [
        { title: 'Sent Prefixes IPv4', field: 'sentPrefixesIpV4'},
        { title: 'Accepted Prefixes IPv4', field: 'acceptedPrefixesIpV4' },
        { title: 'Received Prefixes IPv4', field: 'receivedPrefixesIpV4' },
        { title: 'Sent Prefixes IPv6', field: 'sentPrefixesIpV6' },
        { title: 'Accepted Prefixes IPv6', field: 'acceptedPrefixesIpV6' },
        { title: 'Received Prefixes IPv6', field: 'receivedPrefixesIpV6' },
    ];

  return (
    <div className="bgp-neighbors-table-view view" style={{ display: activeView === 'bgp-neighbors-table' ? 'block' : 'none' }}>
        <h2>BGP Neighbors</h2>
        <Table columns={columns} data={bgpNeighborsTableData} secondaryColumns={secondaryColumns}></Table>
    </div>
  )
}
