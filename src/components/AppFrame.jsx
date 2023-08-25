import React, {useMemo} from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import {useTranslation} from 'react-i18next';


export default function AppFrame({ children }) {
  const {t, i18n} = useTranslation()
  const appTitle = "Solidar"
  const menuOptions = [
    {text:t('APP_FRAME_HOME')},
    {text:t('APP_FRAME_SIMULATORS')},
    {text:t('APP_FRAME_ABOUT')},
  ]

  useMemo(() => {
    i18n.changeLanguage("es")
  }, [i18n])

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {appTitle}
          </Typography>
          { menuOptions.map((option) => (
              <Button key={option.text} color="inherit">{option.text}</Button>
          ))}
        </Toolbar>
      </AppBar>
      <div>
        {children}
      </div>
    </>
  );
} 
