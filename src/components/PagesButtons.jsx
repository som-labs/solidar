import React from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

export default function PageButtons({ pages, ...props }) {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()

  return (
    <>
      {pages.map((page) => (
        <Button
          key={page.text}
          color="inherit"
          size="small"
          onClick={() => navigate(page.path)}
          {...props}
        >
          <Typography variant="h6" sx={{ textTransform: 'none' }}>
            {page.text}
          </Typography>
        </Button>
      ))}
    </>
  )
}
