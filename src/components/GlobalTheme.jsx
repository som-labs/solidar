// This module controls the global theme and its light
// and dark modes.

import useMediaQuery from '@mui/material/useMediaQuery'
import CssBaseline from '@mui/material/CssBaseline'
import SomEnergiaTheme from './SomEnergiaTheme'
import { createTheme, ThemeProvider, responsiveFontSizes } from '@mui/material/styles'
import { useState, useMemo, createContext } from 'react'
import useLocalStorage from '../hooks/LocalStorage'

const ColorModeContext = createContext({
  current: null,
  set: (value) => {},
  toggle: () => {},
})

function GlobalTheme({ children }) {
  //With new design no dark mode used
  //const [colorMode, setColorMode] = useLocalStorage('colorMode', null)
  const [colorMode, setColorMode] = useState('light')
  const colorModeContext = useMemo(
    () => ({
      current: colorMode,
      set: (value) => {
        setColorMode(value)
      },
      toggle: () => {
        if (colorMode === 'dark') return setColorMode('light')
        if (colorMode === 'light') return setColorMode('dark')
        return setColorMode('dark')
      },
    }),
    [colorMode],
  )

  const darkModeMediaQuery = useMediaQuery('(prefers-color-scheme: dark)')
  const isDarkMode = colorMode === 'dark' || (colorMode === null && darkModeMediaQuery)
  const theme = useMemo(() => SomEnergiaTheme(isDarkMode), [isDarkMode])

  return (
    <ColorModeContext.Provider value={colorModeContext}>
      <ThemeProvider theme={theme}>
        <CssBaseline enableColorScheme />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  )
}

export default GlobalTheme
export { ColorModeContext }
