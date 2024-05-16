import {Navigate, Route, Routes } from "react-router-dom"
import { HomePage } from "../pages/HomePage"
import { DevicesPage } from "../pages/DevicesPage"
import { NavBar } from "../components/layout/NavBar"
import { HostsPage } from "../pages/HostsPage"
import DeviceSubPage from "../pages/DeviceSubPage"
import { deviceConfigurationConfig, deviceDataConfig } from "../utils/DeviceViewsConfig"

export const AppRouter = () => {
  return (
    <>
        <NavBar />
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/devices" element={<DevicesPage />} />
            <Route path="/devices/device-data" element={<DeviceSubPage viewsConfig={deviceDataConfig} />} />
            <Route path="/devices/device-configuration" element={<DeviceSubPage viewsConfig={deviceConfigurationConfig} />} />
            <Route path="/hosts" element={<HostsPage />} />
            <Route path="/*" element={<Navigate to="/" />} />
        </Routes>
    </>
);
}
