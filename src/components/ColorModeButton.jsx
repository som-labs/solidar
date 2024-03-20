import BrightnessAutoIcon from '@mui/icons-material/BrightnessAuto'
import BrightnessHighIcon from '@mui/icons-material/BrightnessHigh'
import BrightnessLowIcon from '@mui/icons-material/BrightnessLow'
import IconButton from '@mui/material/IconButton'
import { ColorModeContext } from './GlobalTheme'
import { useContext } from 'react'
import { useTranslation } from 'react-i18next'

export default function ColorModeButton() {
  const { t } = useTranslation()
  const { toggle, current } = useContext(ColorModeContext)
  const modeIcons = {
    dark: BrightnessLowIcon,
    light: BrightnessHighIcon,
  }
  const Icon = modeIcons[current] || BrightnessAutoIcon
  return (
    <>
      <IconButton
        color={'inherit'}
        aria-label={t('APP_FRAME.TOGGLE_COLOR_MODE')}
        title={t('APP_FRAME.TOGGLE_COLOR_MODE')}
        onClick={toggle}
      >
        <Icon />
      </IconButton>
    </>
  )
}
