import { useContext, useEffect, useState } from 'react'

import { AppBar, Toolbar, Typography, Box } from '@mui/material'
import { useTheme } from '@mui/material/styles'

import ColorModeButton from './ColorModeButton'
import LanguageMenu from './LanguageMenu'
import PagesMenu from './PagesMenu'
import PagesButtons from './PagesButtons'
import Footer from './Footer'

import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { ScrollRestoration } from 'react-router-dom'

import { AlertContext } from '../Simulator/components/Alert'
import ParametersMenu from '../Simulator/Parameters/ParametersMenu'
import ContactMenu from '../Simulator/Contact/ContactMenu'
import ProjectMenu from '../Simulator/Project/ProjectMenu'
import { getParametrosEntrada } from '../Simulator/classes/Utiles'

export default function AppFrame({ children }) {
  const { t } = useTranslation()
  const theme = useTheme()
  const { setInLineHelp, inLineHelp, DisplayInLineHelp } = useContext(AlertContext)
  const [inLineHelpIcon, setInLineHelpIcon] = useState(false)

  useEffect(() => {
    //DEMO: Detalle
    const a = getParametrosEntrada('inLineHelp')
    console.log('APPFRAM', a)
    if (a) {
      setInLineHelp(true)
      setInLineHelpIcon(true)
    }
  }, [])

  const navigate = useNavigate()

  const title = 'Solidar Energia'
  const logo = '/logo.png'
  const pages = [
    // {
    //   text: t('APP_FRAME.PAGE_HOME'),
    //   path: '/',
    // },
    // {
    //   text: t('APP_FRAME.PAGE_SIMULATORS'),
    //   path: '/simulator',
    // },
    {
      text: t('APP_FRAME.PAGE_ABOUT'),
      path: '/about',
    },
  ]
  console.log(inLineHelp)
  return (
    <>
      <ScrollRestoration /> {/* Scroll up on page switch */}
      <AppBar
        position="static"
        //enableColorOnDark
        sx={{
          borderRadius: '10px',
          margin: '16px',
          width: 'calc(100% - 32px)',
          backgroundColor: theme.palette.background.default,
        }}
      >
        <Toolbar>
          {/* Page selector for small devices */}
          <PagesMenu
            pages={pages}
            sx={{
              display: {
                xs: 'inline',
                sm: 'none',
              },
            }}
          />

          {/* Logo */}
          <img src={logo} width="56px" style={{ marginInline: '1rem' }} />

          {/* App name */}
          <Typography
            variant="h5"
            component="div"
            sx={{
              flexGrow: 1,
              textTransform: 'uppercase',
            }}
          >
            {title}
          </Typography>

          {/* Page selector for bigger devices */}
          <PagesButtons
            pages={pages}
            sx={{
              display: {
                xs: 'none',
                sm: 'inline',
              },
            }}
          />
          {/* Tool buttons */}
          {/* <ColorModeButton /> */}
          <LanguageMenu />
          <ParametersMenu />
          <ContactMenu />
          <ProjectMenu />
          {inLineHelpIcon && <DisplayInLineHelp />}
        </Toolbar>
      </AppBar>
      <Box sx={{ minHeight: 'calc( 100vh - 7rem )' }}>{children}</Box>
      <Footer />
    </>
  )
}
