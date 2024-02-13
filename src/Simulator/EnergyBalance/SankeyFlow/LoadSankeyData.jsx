import { useEffect } from 'react'
import Papa from 'papaparse'
import energy from './energy.csv'

export default function LoadSankeyData(load, filterData, minMax, initSlider) {
  const setInit = load
  const setSankeyData = filterData
  const setMinMax = minMax
  const setMinMax2 = initSlider

  useEffect(() => {
    Papa.parse(energy, {
      download: true,
      header: true,
      dynamicTyping: true,
      complete: (results) => {
        setSankeyData(results.data)
        setInit(results.data)
        setMinMax([
          Math.min(...results.data.map((o) => o.value)),
          Math.max(...results.data.map((o) => o.value)),
        ])
        setMinMax2([
          Math.min(...results.data.map((o) => o.value)),
          Math.max(...results.data.map((o) => o.value)),
        ])
      },
    })
  }, [])
}
