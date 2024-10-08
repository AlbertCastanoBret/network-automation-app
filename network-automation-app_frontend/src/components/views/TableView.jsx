import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import queryString from 'query-string';
import { fetchData } from '../../utils/fetchData';
import { Table } from '../common/Table';

export const TableView = ({ activeView, config }) => {
    const [tableData, setTableData] = useState([]);
    const location = useLocation();
    const { deviceId } = queryString.parse(location.search);

    useEffect(() => {
        if (activeView === config.viewId) {
            const loadData = async () => {
                const apiData = await fetchData(config.apiUrl.replace(':deviceId', deviceId));
                const mappedData = apiData.map(config.mapFunc);
                setTableData(mappedData);
            };
            loadData();
            
            const intervalId = setInterval(loadData, 10000);
            return () => clearInterval(intervalId);
        }
    }, [deviceId, activeView, config]);

    return (
        <div className={`${config.viewId}-view view ${activeView === config.viewId ? 'block' : 'none'}`}>
            <h2>{config.title}</h2>
            <Table columns={config.columns} data={tableData} secondaryColumns={config.secondaryColumns}></Table>
        </div>
    );
};