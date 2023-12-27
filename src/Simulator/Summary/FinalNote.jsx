import React from 'react'
import { useTranslation } from 'react-i18next'

// MUI objects
import Typography from '@mui/material/Typography'
import Container from '@mui/material/Container'
import Download from '@mui/icons-material/Download'
import Print from '@mui/icons-material/Print'
import { Button } from '@mui/material'

export default function FinalNote() {
  const { t } = useTranslation()

  function printSummary() {
    window.print()
  }
  return (
    <>
      <Container>
        <Button
          variant="contained"
          startIcon={<Print />}
          size="large"
          onClick={printSummary}
        >
          Imprime Resumen
        </Button>
        <Button variant="contained" startIcon={<Download />} size="large">
          Descarga Informe Completo
        </Button>
        <Typography variant="h4">{t('BASIC.LABEL_AVISO')}</Typography>
        <Typography
          variant="body"
          dangerouslySetInnerHTML={{
            __html: t('SUMMARY.LABEL_disclaimer1'),
          }}
        />
        <Typography
          variant="body"
          dangerouslySetInnerHTML={{
            __html: t('SUMMARY.LABEL_disclaimer2'),
          }}
        />
      </Container>
    </>
  )
}
