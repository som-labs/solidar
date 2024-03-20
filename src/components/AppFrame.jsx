import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'

import ColorModeButton from './ColorModeButton'
import LanguageMenu from './LanguageMenu'
import PagesMenu from './PagesMenu'
import PagesButtons from './PagesButtons'
import Footer from './Footer'

import { useContext, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { ScrollRestoration } from 'react-router-dom'

import { AlertContext } from '../Simulator/components/Alert'
import ParametersMenu from '../Simulator/Parameters/ParametersMenu'
import ContactMenu from '../Simulator/Contact/ContactMenu'
import InLineHelp from '../Simulator/InLineHelp/InLineHelp'
import ProjectMenu from '../Simulator/Project/ProjectMenu'
import { getParametrosEntrada } from '../Simulator/classes/Utiles'

export default function AppFrame({ children }) {
  const { t } = useTranslation()

  const { setInLineHelp } = useContext(AlertContext)

  useEffect(() => {
    //DEMO: Detalle
    const a = getParametrosEntrada('inLineHelp')

    if (a.length >= 0) setInLineHelp(true)
    else setInLineHelp(false)
  }, [])

  const navigate = useNavigate()

  const title = 'Solidar Energia (Individual)'
  const logo = '/logo.svg'
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

  // TODO: Move styling to the global style
  return (
    <>
      <ScrollRestoration /> {/* Scroll up on page switch */}
      <AppBar position="static" enableColorOnDark>
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
          <img src={logo} width="32px" style={{ marginInline: '.5rem' }} />

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
          <ColorModeButton />
          <LanguageMenu />
          <ParametersMenu />
          <ContactMenu />
          <ProjectMenu />
          <InLineHelp />
        </Toolbar>
      </AppBar>
      <Box sx={{ minHeight: 'calc( 100vh - 7rem )' }}>{children}</Box>
      <Footer />
    </>
  )
}
