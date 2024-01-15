import { useContext } from 'react'
import { useTranslation } from 'react-i18next'

// MUI objects
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Container from '@mui/material/Container'

// REACT Solidar Components
import { EconomicContext } from '../EconomicContext'

// Solidar objects
import TCB from '../classes/TCB'
import * as UTIL from '../classes/Utiles'

export default function SubvencionEU() {
  const { t } = useTranslation()

  const { subvencionEU, setSubvencionEU, setValorSubvencionEU, ecoData, setEcoData } =
    useContext(EconomicContext)

  const onChangeEU = (event, tipoSubvencion) => {
    TCB.tipoSubvencionEU = tipoSubvencion
    TCB.economico.calculoFinanciero(100, 100)

    setSubvencionEU(tipoSubvencion)
    setValorSubvencionEU(TCB.valorSubvencionEU)
    setEcoData(TCB.economico)
  }

  if ((TCB.consumo.cTotalAnual / TCB.produccion.pTotalAnual) * 100 < 80) {
    setSubvencionEU('Sin')
    return (
      <Container>
        <Typography variant="h4" color="red" textAlign={'center'}>
          {t('No hay subvencion posible')}
        </Typography>
        <Typography
          variant="body"
          textAlign={'center'}
          dangerouslySetInnerHTML={{
            __html: t('ECONOMIC_BALANCE.DESCRIPTION_Consumo%Produccion', {
              Consumo_Produccion: UTIL.formatoValor(
                'porciento',
                (TCB.consumo.cTotalAnual / TCB.produccion.pTotalAnual) * 100,
              ),
            }),
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
              <ToggleButton value="Sin">{t('Economico.PROP.sinSubvencion')}</ToggleButton>
              <ToggleButton value="Individual">
                {t('Economico.PROP.subvencionIndividual')}
              </ToggleButton>
              <ToggleButton value="Comunitaria">
                {t('Economico.PROP.subvencionComunitaria')}
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Container>
      </>
    )
  }
}
