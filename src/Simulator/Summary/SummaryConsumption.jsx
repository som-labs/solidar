import { useContext } from 'react'
import { useTranslation } from 'react-i18next'

// MUI objects
import Typography from '@mui/material/Typography'
import Container from '@mui/material/Container'
import { DataGrid } from '@mui/x-data-grid'

// REACT Solidar Components
import { ConsumptionContext } from '../ConsumptionContext'
import SummaryPreciosTarifa from './SummaryPreciosTarifa'

// Solidar objects
import * as UTIL from '../classes/Utiles'

export default function SummaryConsumption() {
  const { t } = useTranslation()
  const { tipoConsumo, setTipoConsumo } = useContext(ConsumptionContext)

  const columns = [
    {
      field: 'nombreTipoConsumo',
      headerName: t('TipoConsumo.LABEL_nombreTipoConsumo'),
      editable: true,
      flex: 1,
      description: t('TipoConsumo.TOOLTIP_nombreTipoConsumo'),
    },
    {
      field: 'cTotalAnual',
      headerName: t('TipoConsumo.LABEL_cTotalAnual'),
      type: 'number',
      width: 150,
      description: t('TipoConsumo.TOOLTIP_cTotalAnual'),
      valueFormatter: (params) => UTIL.formatoValor('cTotalAnual', params.value),
    },
  ]

  const getRowId = (row) => {
    return row.idTipoConsumo
  }

  return (
    <>
      <Container>
        <Typography variant="h3" textAlign={'center'}>
          {t('SUMMARY.TITLE_CONSUMO')}
        </Typography>
        <SummaryPreciosTarifa></SummaryPreciosTarifa>
        <Typography variant="body">{t('SUMMARY.DESCRIPTION_CONSUMO')}</Typography>
        <DataGrid
          autoHeight
          rowHeight={30}
          getRowId={getRowId}
          rows={tipoConsumo}
          columns={columns}
          hideFooter={true}
          sx={{
            boxShadow: 2,
            border: 2,
            borderColor: 'primary.light',
            mb: '0.5rem',
          }}
        />
      </Container>
    </>
  )
}
