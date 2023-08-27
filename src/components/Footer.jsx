import React from 'react'
import Paper from '@mui/material/Paper'
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import { useTranslation } from 'react-i18next'

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
        <p>{t("Solidar 2023")}</p>
        <p>{t("Grupo Local Madrid")}</p>
        <p>{t("Som Energia")}</p>
      </Box>
    </Container>
  </Paper>
}

