import { useContext } from 'react'
import { GlobalContext } from '../GlobalContext.jsx'

// MUI objects
import HelpIcon from '@mui/icons-material/Help'
import IconButton from '@mui/material/IconButton'

export default function InLineHelp() {
  //DEMO: Detalle
  const { inLineHelp, setInLineHelp } = useContext(GlobalContext)

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
