import React from 'react'
import Paper from '@mui/material/Paper'
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import { useTranslation } from 'react-i18next'
import footerItems from '../data/footeritems.yaml'
import { Link } from "react-router-dom"

export default function Footer() {
  const {t, i18n} = useTranslation()
  return <Paper color="primary" elevation={3}
    sx={{
      backgroundColor: "primary.main",
      color: "primary.contrastText",
      padding: '1rem',
    }}
  >
    <Container>
      <Box sx={{display: 'flex', flexFlow: 'row', gap: 10}}>
        { footerItems.map((item)=> item.url? (
          <div key={item.text}><Link color="primary.contrastText" to={item.url} target='_blank'>{item.text}</Link></div>
        ): (
          <div key={item.text}>{item.text}</div>
        ))}
      </Box>
    </Container>
  </Paper>
}

