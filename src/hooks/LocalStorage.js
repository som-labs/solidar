import React from 'react'

/**
 * Hook to store a persistent state in local storage.
 * The state is shared among any component using it
 * from any tab of the same browser accessing the same domain.
 * A null value means the value is unset.
 * Setting the state to null unsets it. 
 * Any other value is converted to string including undefined.
 * The initial value is set only if the value is unset
 * on component initialization.
 * undefined initial value is ignored.
 */

export default function useLocalStorage(key, initialValue) {
  function setStorage(value) {
    if (value===null)
      localStorage.removeItem(key)
    else
      localStorage.setItem(key, value)
  }
  const [state, setState] = React.useState(() => {
    const storedValue = localStorage[key]
    if (storedValue === null) {
      if (initialValue!==undefined) {
        setStorage(initialValue??null)
      }
    }
    return localStorage.getItem(key)
  })
  // Update state when changed from other tab
  React.useEffect(()=>{
    const listener = (e)=>{
      if (e.key === key) {
        setState(e.newValue)
      }
    }
    window.addEventListener("storage", listener)
    return ()=>{
      window.removeEventListener('storage', listener)
    }
  },[])
  // Offer a setter that updates the storage
  // The state is set to the actual storage value (str conversion or null)
  const persistentSetState = React.useCallback((value)=>{
    setStorage(value)
    setState(localStorage.getItem(key))
  })
  return [state, persistentSetState]

}

