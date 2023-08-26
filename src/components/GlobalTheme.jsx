// This module controls the global theme and its light
// and dark modes.

import useMediaQuery from '@mui/material/useMediaQuery'
import CssBaseline from '@mui/material/CssBaseline';
import SomEnergiaTheme from './SomEnergiaTheme'
import { createTheme, ThemeProvider, responsiveFontSizes } from '@mui/material/styles';
import React from 'react'
import useLocalStorage from '../hooks/LocalStorage'


const ColorModeContext = React.createContext({
  current: null,
  set: (value) => {},
  toggle: () => {},
});

function GlobalTheme({children}) {
  const [colorMode, setColorMode] = useLocalStorage('colorMode', null)
  const colorModeContext = React.useMemo(()=>({
    current: colorMode,
    set: (value) => {
      setColorMode(value)
    },
    toggle: () => {
      if (colorMode==='dark') return setColorMode('light')
      if (colorMode==='light') return setColorMode(null)
      return setColorMode('dark')
    },
  }), [colorMode])

  const darkModeMediaQuery = useMediaQuery('(prefers-color-scheme: dark)')
  const isDarkMode = colorMode==='dark' || (colorMode === null && darkModeMediaQuery)
  const theme = React.useMemo(
    () => SomEnergiaTheme(isDarkMode),
    [isDarkMode],
  )

  return (
    <ColorModeContext.Provider value={colorModeContext}>
      <ThemeProvider theme={theme}>
        <CssBaseline enableColorScheme/>
          {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  )
}

export default GlobalTheme
export {ColorModeContext}
