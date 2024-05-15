import React, { useState } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { ARPTableView} from '../components/views/ARPTableView';
import { FactsView } from '../components/views/FactsView';
import { ChartsView } from '../components/views/ChartsView';
import { InterfacesTableView } from '../components/views/InterfacesTableView';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const DeviceDataPage = () => {

    const [activeView, setActiveView] = useState('status');

    return (
        <div className='device-data-page'>
            <h1>Device Data</h1>
            <div className="device-data-container">
                <div className="options-container">
                    <button className={`button ${activeView === 'status' ? 'button-active' : ''}`} onClick={() => setActiveView('status') }>Status</button>
                    <button className={`button ${activeView === 'facts' ? 'button-active' : ''}`} onClick={() => setActiveView('facts')}>Facts</button>
                    <button className={`button ${activeView === 'arp-table' ? 'button-active' : ''}`} onClick={() => setActiveView('arp-table')}>ARP Table</button>
                    <button className={`button ${activeView === 'interfaces-table' ? 'button-active' : ''}`} onClick={() => setActiveView('interfaces-table')}>Interfaces</button>
                </div>
                <ChartsView activeView={activeView}></ChartsView>
                <FactsView activeView={activeView}></FactsView>
                <ARPTableView activeView={activeView}></ARPTableView>
                <InterfacesTableView activeView={activeView}></InterfacesTableView>
            </div>
        </div>
    );
};

export default DeviceDataPage;