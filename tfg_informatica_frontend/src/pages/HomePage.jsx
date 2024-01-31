import React, { useEffect, useState } from 'react'
import { fetchData } from '../utils/fetchData';

export const HomePage = () => {

    const [data, setData] = useState({})

    useEffect(() => {
        const loadData = async () => {
            const apiData = await fetchData('/devices/a');
            setData(apiData);
            console.log(apiData)
        }
        loadData()
    }, [])

  return (
    <>
      <div>HomePage</div>
      <div>{JSON.stringify(data)}</div>
    </>
  )
}
