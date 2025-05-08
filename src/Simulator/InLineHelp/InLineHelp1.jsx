import { useContext } from 'react'
import { AlertContext } from '../components/Alert'

// MUI objects
import HelpIcon from '@mui/icons-material/Help'
import IconButton from '@mui/material/IconButton'

export default function DisplayInLineHelp() {
  //DEMO: Detalle
  const { inLineHelp, setInLineHelp } = useContext(AlertContext)

  const swapInLineHelp = () => {
    setInLineHelp(!inLineHelp)
  }

  return (
    <>
      <IconButton color={'inherit'} onClick={swapInLineHelp}>
        <HelpIcon />
      </IconButton>
    </>
  )
}
