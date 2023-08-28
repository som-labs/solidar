import React from 'react'
import Paper from '@mui/material/Paper'
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import footerItems from '../data/footeritems.yaml'

export default function Footer() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  return (
    <Paper
      color="primary"
      elevation={3}
      sx={{
        backgroundColor: 'primary.main',
        color: 'primary.contrastText',
        padding: '1rem',
        mt: '2rem',
      }}
    >
      <Container>
        <Box sx={{ display: 'flex', flexFlow: 'row', gap: 10 }}>
          {footerItems.map((item) => (
            <Button
              key={item.text}
              href={item.url}
              color="inherit"
              size="small"
              target="_blank"
            >
              <Typography variant="body1" sx={{ textTransform: 'none' }}>
                {item.text}
              </Typography>
            </Button>
          ))}
        </Box>
      </Container>
    </Paper>
  )
}
