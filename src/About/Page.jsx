import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import AppFrame from '../components/AppFrame'
import { Paper, Button, Typography } from '@mui/material'
import SimulatorPage from '../Simulator/Page'

export default function Page() {
  const { t } = useTranslation()
  const [showComponent, setShowComponent] = useState(false)

  const handleOpenComponent = () => {
    setShowComponent(true)
  }

  return (
    <>
      {!showComponent ? (
        <AppFrame>
          <Paper elevation={4} sx={{ padding: 4, margin: 2 }}>
            <h1>{t('ABOUT.TITLE')}</h1>
            <Typography
              variant="body"
              dangerouslySetInnerHTML={{
                __html: t('ABOUT.TEXT'),
              }}
            />
            <Button variant="contained" size="large" onClick={handleOpenComponent}>
              {t('REPORT.RETURN')}
            </Button>
          </Paper>
        </AppFrame>
      ) : (
        <SimulatorPage />
      )}
    </>
  )
}
