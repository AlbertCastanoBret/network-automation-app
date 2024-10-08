import React, { useState } from 'react';

const DeviceSubPage = ({ viewsConfig }) => {
    const [activeView, setActiveView] = useState(viewsConfig[0].id);

    return (
        <div className='device-data-page'>
            <h1>Device Data</h1>
            <div className="device-data-container">
                <div className="options-container">
                    {viewsConfig.map(view => (
                        <button
                            key={view.id}
                            className={`button ${activeView === view.id ? 'button-active' : ''}`}
                            onClick={() => setActiveView(view.id)}
                        >
                            {view.label}
                        </button>
                    ))}
                </div>
                {viewsConfig.map(view => {
                    if (activeView === view.id) {
                        const ViewComponent = view.component;
                        return (
                            <ViewComponent
                                key={view.id}
                                activeView={view.id}
                                config={view.componentConfig}
                            />
                        );
                    }
                    return null;
                })}
            </div>
        </div>
    );
};

export default DeviceSubPage;