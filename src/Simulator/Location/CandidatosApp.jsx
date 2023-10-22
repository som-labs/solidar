import { useState, useMemo, useRef, useEffect } from 'react'
//import debounce from "lodash/debounce";
import { debounce } from '@mui/material/utils'

const DebounceWithStateAndRef = () => {
  const [value, setValue] = useState('initial')
  const ref = useRef()

  const onChange = () => {
    console.log('State value:', value)
  }

  useEffect(() => {
    ref.current = onChange
  }, [onChange])

  const debouncedCallback = useMemo(() => {
    const func = () => {
      ref.current?.()
    }

    return debounce(func, 1000)
  }, [])

  return (
    <input
      onChange={(e) => {
        debouncedCallback()
        setValue(e.target.value)
      }}
      value={value}
    />
  )
}

const useDebounce = (callback) => {
  const ref = useRef()

  useEffect(() => {
    ref.current = callback
  }, [callback])

  const debouncedCallback = useMemo(() => {
    const func = () => {
      ref.current?.()
    }

    return debounce(func, 1000)
  }, [])

  return debouncedCallback
}

const DebounceWithUseCallbackAndState = () => {
  const [value, setValue] = useState('initial')

  const onChange = () => {
    console.log('State value:', value)
  }

  const debouncedOnChange = useDebounce(onChange)

  return (
    <input
      onChange={(e) => {
        debouncedOnChange()
        setValue(e.target.value)
      }}
      value={value}
    />
  )
}

function CandidatosApp() {
  return (
    <div className="App">
      <h1>Final working debounce with ref</h1>
      <h3>Open console and type something in inputs</h3>
      <div className="container">
        <div className="column">
          <h3>Debounce with state and ref</h3>
          <DebounceWithStateAndRef />
          Works like a charm!
        </div>
        <div className="column">
          <h3>Extracted into a hook</h3>
          <DebounceWithUseCallbackAndState />
          Still works!
        </div>
      </div>
    </div>
  )
}

export default CandidatosApp
