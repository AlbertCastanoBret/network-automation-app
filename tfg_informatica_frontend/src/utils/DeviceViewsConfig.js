import { ChartsView } from '../components/views/ChartsView';
import { FactsView } from '../components/views/FactsView';
import { ConfigView } from '../components/views/ConfigView';
import { TableView } from '../components/views/TableView';
import TerminalView from '../components/views/TerminalView';

export const arpConfig = {
    viewId: 'arp-table',
    apiUrl: '/devices/arp_table/:deviceId',
    title: 'ARP Table',
    columns: [
        { title: 'IP Address', field: 'ip_address' },
        { title: 'MAC Address', field: 'mac_address' },
        { title: 'Interface', field: 'interface' }
    ],
    mapFunc: arpRow => ({
        ip_address: arpRow.ip_address ?? 'N/A',
        mac_address: arpRow.mac_address ?? 'N/A',
        interface: arpRow.interface ?? 'N/A'
    })
};

export const interfacesConfig = {
    viewId: 'interfaces-table',
    apiUrl: '/devices/interfaces/:deviceId',
    title: 'Interfaces',
    columns: [
        { title: '', field: 'arrowButton'},
        { title: 'Interface Name', field: 'interfaceName' },
        { title: 'Operational Status', field: 'isUp' },
        { title: 'Administrative Status', field: 'isEnabled' },
        { title: 'Speed', field: 'speed' }
    ],
    secondaryColumns: [
        { title: 'TX Errors', field: 'tx_errors' },
        { title: 'RX Errors', field: 'rx_errors' },
        { title: 'TX Discards', field: 'tx_discards' },
        { title: 'RX Discards', field: 'rx_discards' },
        { title: 'TX Octets', field: 'tx_octets' },
        { title: 'RX Octets', field: 'rx_octets' },
        { title: 'TX Unicast Packets', field: 'tx_unicast_packets' },
        { title: 'RX Unicast Packets', field: 'rx_unicast_packets' }
    ],
    mapFunc: interfaceRow => ({
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
    })
};

export const bgpNeighborsConfig = {
    viewId: 'bgp-neighbors-table',
    apiUrl: '/devices/bgp_neighbors/:deviceId',
    title: 'BGP Neighbors',
    columns: [
        { title: '', field: 'arrowButton'},
        { title: 'Neighbor Address', field: 'neighborAdress' },
        { title: 'Operational Status', field: 'isUp' },
        { title: 'Administrative Status', field: 'isEnabled' },
        { title: 'Local AS', field: 'localAs' },
        { title: 'Remote AS', field: 'remoteAs' },
        { title: 'Remote ID', field: 'remoteId' },
        { title: 'Uptime', field: 'uptime' }
    ],
    secondaryColumns: [
        { title: 'Sent Prefixes IPv4', field: 'sentPrefixesIpV4' },
        { title: 'Accepted Prefixes IPv4', field: 'acceptedPrefixesIpV4' },
        { title: 'Received Prefixes IPv4', field: 'receivedPrefixesIpV4' },
        { title: 'Sent Prefixes IPv6', field: 'sentPrefixesIpV6' },
        { title: 'Accepted Prefixes IPv6', field: 'acceptedPrefixesIpV6' },
        { title: 'Received Prefixes IPv6', field: 'receivedPrefixesIpV6' }
    ],
    mapFunc: bgpNeighborsRow => ({
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
        receivedPrefixesIpV6: bgpNeighborsRow.received_prefixes_ipv6 ?? 'N/A'
    })
};

export const deviceDataConfig = [
    { id: 'status', label: 'Status', component: ChartsView, activeView: "status" },
    { id: 'facts', label: 'Facts', component: FactsView, activeView: "facts"},
    { id: 'arp-table', label: 'ARP Table', component: TableView, activeView: "arp-table", componentConfig: arpConfig},
    { id: 'interfaces-table', label: 'Interfaces', component: TableView, activeView: "interfaces-table", componentConfig: interfacesConfig},
    { id: 'bgp-neighbors-table', label: 'BGP', component: TableView, activeView: "bgp-neighbors-table", componentConfig: bgpNeighborsConfig}
];

export const deviceConfigurationConfig = [
    { id: 'config', label: 'Configuration', component: ConfigView, activeView: "config" },
    { id: 'terminal' , label: 'Terminal', component: TerminalView, activeView: "terminal"}
];