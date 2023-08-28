import React from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import IconButton from '@mui/material/IconButton'
import Box from '@mui/material/Box'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import MenuIcon from '@mui/icons-material/Menu'

export default function PagesMenu({ pages, ...props }) {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()

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
        id="pages-button"
        aria-label={t('APP_FRAME.SECTIONS')}
        aria-controls="pages-menu"
        color="inherit"
        onClick={openMenu}
        edge="start"
        {...props}
      >
        <MenuIcon />
      </IconButton>
      <Menu
        id="pages-menu"
        MenuListProps={{
          'aria-labelledby': 'pages-button',
        }}
        anchorEl={menuAnchor}
        open={open}
        onClose={closeMenu}
      >
        {pages.map((page) => (
          <MenuItem
            key={page.text}
            onClick={() => {
              navigate(page.path)
              closeMenu()
            }}
          >
            {page.text}
          </MenuItem>
        ))}
      </Menu>
    </>
  )
}
