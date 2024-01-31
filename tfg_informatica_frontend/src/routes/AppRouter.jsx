import {Navigate, Route, Routes } from "react-router-dom"
import { HomePage } from "../pages/HomePage"

export const AppRouter = () => {
  return (
    <>
        <Routes>
          <Route path="/" element={<HomePage></HomePage>}></Route>
        </Routes>
    </>
  )
}
