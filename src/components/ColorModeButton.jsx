import BrightnessAutoIcon from '@mui/icons-material/BrightnessAuto';
import BrightnessHighIcon from '@mui/icons-material/BrightnessHigh';
import BrightnessLowIcon from '@mui/icons-material/BrightnessLow';
import IconButton from '@mui/material/IconButton';
import { ColorModeContext } from './GlobalTheme'
import React from 'react'

export default function ColorModeButton() {
  const {toggle, current} = React.useContext(ColorModeContext)
  const modeIcons = {
    'dark': BrightnessLowIcon,
    'light': BrightnessHighIcon,
  }
  const Icon = modeIcons[current] || BrightnessAutoIcon
  return <>
      <IconButton
        color={'inherit'}
        aria-label="Toggle Color Mode"
        onClick={ toggle }
      >
        <Icon/>
      </IconButton>
    </>
}



