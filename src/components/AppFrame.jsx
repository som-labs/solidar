import React from 'react'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import ColorModeButton from './ColorModeButton'
import LanguageMenu from './LanguageMenu'
import PagesMenu from './PagesMenu'
import PagesButtons from './PagesButtons'
import { useTranslation } from 'react-i18next'
import { useNavigate } from "react-router-dom"

export default function AppFrame({children}) {
  const {t, i18n} = useTranslation()
  const navigate = useNavigate()

  const title = "Solidar"
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
      <AppBar position="static" enableColorOnDark>
        <Toolbar>
          <PagesMenu
            pages={pages}
            sx={{
              display: {
                xs: 'inline',
                sm: 'none',
              },
            }}
          />
          <img
            src="/logo.svg"
            width="32px"
            style={{marginInline: '.5rem'}}
          />
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

          <PagesButtons
            pages={pages}
            sx={{
              display: {
                xs: 'none',
                sm: 'inline',
              },
            }}
          />
          <ColorModeButton />
          <LanguageMenu />
        </Toolbar>
      </AppBar>
      <div>
        {children}
      </div>
    </>
  )
} 
