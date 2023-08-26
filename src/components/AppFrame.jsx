import React, {useMemo} from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import ColorModeButton from './ColorModeButton'
import LanguageMenu from './LanguageMenu'
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
          <Typography variant="h4" component="div" sx={{ flexGrow: 1 }}>
            {title}
          </Typography>
          { pages.map((page) => (
            <Button
              key={page.text}
              color="inherit"
              onClick={()=>navigate(page.path)}
            >
              <Typography variant="h6" sx={{textTransform: 'none'}}>
                {page.text}
              </Typography>
            </Button>
          ))}
          <ColorModeButton />
          <LanguageMenu />
        </Toolbar>
      </AppBar>
      <div>
        {children}
      </div>
    </>
  );
} 
