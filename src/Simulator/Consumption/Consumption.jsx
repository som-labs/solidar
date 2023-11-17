import React, { useEffect, useState, useContext } from 'react'
import { useTranslation } from 'react-i18next'

// MUI objects
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import AddIcon from '@mui/icons-material/Add'
import Tooltip from '@mui/material/Tooltip'
import Container from '@mui/material/Container'
import DeleteIcon from '@mui/icons-material/Delete'
import AnalyticsIcon from '@mui/icons-material/Analytics'
import Box from '@mui/material/Box'
import { DataGrid } from '@mui/x-data-grid'

// REACT Solidar Components
import MapaMesHora from './MapaMesHora'
import { useDialog } from '../../components/DialogProvider'
import DialogNewConsumption from './DialogNewConsumption'
import PreciosTarifa from './PreciosTarifa'

// Solidar objects
import TCBContext from '../TCBContext'
import TCB from '../classes/TCB'
import { formatoValor } from '../classes/Utiles'
import MapaDiaHora from './MapaDiaHora'
import ConsumptionSummary from './ConsumptionSummary'

const ConsumptionStep = () => {
  const { t, i18n } = useTranslation()

  return (
    <>
      <Container>
        <Typography variant="h3">{t('CONSUMPTION.TITLE')}</Typography>
        <PreciosTarifa></PreciosTarifa>
        <Box>
          <Typography
            variant="body"
            dangerouslySetInnerHTML={{
              __html: t('CONSUMPTION.DESCRIPTION'),
            }}
          />
          <ConsumptionSummary inSummary={false}></ConsumptionSummary>
        </Box>
      </Container>
    </>
  )
}

export default ConsumptionStep
