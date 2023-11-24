import { useContext } from 'react'
import { useTranslation } from 'react-i18next'

// MUI objects
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Container from '@mui/material/Container'

// REACT Solidar Components
import EconomicContext from './EconomicContext'

// Solidar objects
import TCB from '../classes/TCB'

const SubvencionEU = () => {
  const { t, i18n } = useTranslation()

  const {
    subvencionEU,
    setSubvencionEU,
    valorSubvencionEU,
    setValorSubvencionEU,
    setCashFlow,
    setPeriodoAmortizacion,
  } = useContext(EconomicContext)

  const onChangeEU = (event, tipoSubvencion) => {
    setSubvencionEU(tipoSubvencion)
    TCB.tipoSubvencionEU = tipoSubvencion
    TCB.economico.calculoFinanciero(100, 100)
    console.log(TCB.valorSubvencionEU)

    setValorSubvencionEU(TCB.valorSubvencionEU)
    setCashFlow(TCB.economico.cashFlow)
    setPeriodoAmortizacion(TCB.economico.periodoAmortizacion)
  }

  console.log(TCB.valorSubvencionEU)
  if ((TCB.consumo.cTotalAnual / TCB.produccion.pTotalAnual) * 100 < 80) {
    setSubvencionEU('Sin')
    return (
      <Container>
        <Typography variant="h3">{t('No hay subvencion posible')}</Typography>
        <Typography
          variant="body"
          textAlign={'center'}
          dangerouslySetInnerHTML={{
            __html: t('ECONOMIC_BALANCE.EU_DESCRIPTION'),
          }}
        />
      </Container>
    )
  } else {
    return (
      <>
        <Container>
          <Box
            component="form"
            sx={{
              display: 'flex',
              flexDirection: 'column',
              flexWrap: 'wrap',
              width: '100%',
            }}
          >
            <Typography variant="h4">{t('ECONOMIC_BALANCE.EU_TITLE')}</Typography>
            <Typography
              variant="body"
              textAlign={'center'}
              dangerouslySetInnerHTML={{
                __html: t('ECONOMIC_BALANCE.EU_DESCRIPTION'),
              }}
            />

            <ToggleButtonGroup
              value={subvencionEU}
              color="primary"
              exclusive
              onChange={onChangeEU}
              orientation="vertical"
            >
              <ToggleButton value="Sin">
                {t('Economico.LABEL_sinSubvencion')}
              </ToggleButton>
              <ToggleButton value="Individual">
                {t('Economico.LABEL_subvencionIndividual')}
              </ToggleButton>
              <ToggleButton value="Comunitaria">
                {t('Economico.LABEL_subvencionComunitaria')}
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Container>
      </>
    )
  }
}

export default SubvencionEU
