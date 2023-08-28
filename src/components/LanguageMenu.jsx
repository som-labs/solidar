import TranslateIcon from '@mui/icons-material/Translate'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import CheckIcon from '@mui/icons-material/Check'
import ListItemIcon from '@mui/material/ListItemIcon'
import React from 'react'
import { useTranslation } from 'react-i18next'
import languages from '../data/languages.yaml'

export default function LanguageMenu() {
  const { t, i18n } = useTranslation()

  const [menuAnchor, setMenuAnchor] = React.useState(null)
  const open = Boolean(menuAnchor)
  const openMenu = (event) => {
    setMenuAnchor(event.currentTarget)
  }
  const closeMenu = () => {
    setMenuAnchor(null)
  }

  return (
    <>
      <IconButton
        color={'inherit'}
        aria-label={t('APP_FRAME.CHANGE_LANGUAGE')}
        title={t('APP_FRAME.CHANGE_LANGUAGE')}
        id="language-button"
        aria-controls={open ? 'language-menu' : undefined}
        aria-expanded={open ? 'true' : undefined}
        aria-haspopup="true"
        onClick={openMenu}
      >
        <TranslateIcon />
      </IconButton>
      <Menu
        id="language-menu"
        MenuListProps={{
          'aria-labelledby': 'language-button',
        }}
        anchorEl={menuAnchor}
        open={open}
        onClose={closeMenu}
      >
        {languages.supportedLanguages.map((language) => (
          <MenuItem
            key={language.id}
            selected={language.id === i18n.language}
            onClick={() => {
              i18n.changeLanguage(language.id)
              closeMenu()
            }}
          >
            <ListItemIcon>{language.id === i18n.language && <CheckIcon />}</ListItemIcon>
            {language.text}
          </MenuItem>
        ))}
        {languages.translateUrl && (
          <MenuItem
            onClick={() => {
              window.open(languages.translateUrl, '_blank')
              closeMenu()
            }}
          >
            {t('APP_FRAME.CONTRIBUTE_TRANSLATIONS')}
          </MenuItem>
        )}
      </Menu>
    </>
  )
}
