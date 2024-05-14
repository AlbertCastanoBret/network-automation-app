import {Navigate, Route, Routes } from "react-router-dom"
import { HomePage } from "../pages/HomePage"
import { DevicesPage } from "../pages/DevicesPage"
import { NavBar } from "../components/layout/NavBar"
import { HostsPage } from "../pages/HostsPage"
import DeviceDataPage from "../pages/DeviceDataPage"

export const AppRouter = () => {
  return (
    <>
        <NavBar></NavBar>
        <Routes>
          <Route path="/" element={<HomePage></HomePage>}></Route>
          <Route path="/devices" element={<DevicesPage></DevicesPage>}></Route>
          <Route path="/devices/device-data" element={<DeviceDataPage></DeviceDataPage>}></Route>

          <Route path="/hosts" element={<HostsPage></HostsPage>}></Route>
          <Route path="/*" element={<Navigate to="/"></Navigate>}></Route>
        </Routes>
    </>
  )
}
