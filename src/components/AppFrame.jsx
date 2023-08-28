import React from 'react'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import ColorModeButton from './ColorModeButton'
import LanguageMenu from './LanguageMenu'
import PagesMenu from './PagesMenu'
import PagesButtons from './PagesButtons'
import Footer from './Footer'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { ScrollRestoration } from 'react-router-dom'

export default function AppFrame({ children }) {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()

  const title = 'Solidar'
  const logo = '/logo.svg'
  const pages = [
    {
      text: t('APP_FRAME.PAGE_HOME'),
      path: '/',
    },
    {
      text: t('APP_FRAME.PAGE_SIMULATORS'),
      path: '/simulator',
    },
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
        </Toolbar>
      </AppBar>
      <Box sx={{ minHeight: 'calc( 100vh - 7rem )' }}>{children}</Box>
      <Footer />
    </>
  )
}
