import { useContext } from 'react'
import { useTranslation } from 'react-i18next'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import ReactMarkdown from 'react-markdown'
import Container from '@mui/material/Container'
import FormControl from '@mui/material/FormControl'
import Button from '@mui/material/Button'
import Tooltip from '@mui/material/Tooltip'
import EconomicContext from './EconomicContext'
import TCB from '../classes/TCB'

const SubvencionEU = () => {
  const { t, i18n } = useTranslation()

  const { subvencionEU, setSubvencionEU } = useContext(EconomicContext)

  const onChangeEU = (event, tipoSubvencion) => {
    setSubvencionEU(tipoSubvencion)
    TCB.tipoSubvencionEU = tipoSubvencion
    TCB.economico.calculoFinanciero(100, 100)
  }

  if ((TCB.consumo.cTotalAnual / TCB.produccion.pTotalAnual) * 100 < 80) {
    setSubvencionEU('Sin')
    return (
      <Container>
        <Typography variant="h3">{t('No hay subvencion posible')}</Typography>
        <ReactMarkdown children={t('ECONOMIC_BALANCE.EU_DESCRIPTION')} />
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
            <ReactMarkdown children={t('ECONOMIC_BALANCE.EU_DESCRIPTION')} />

            <ToggleButtonGroup
              value={subvencionEU}
              color="primary"
              exclusive
              onChange={onChangeEU}
              orientation="vertical"
            >
              <ToggleButton value="Sin">
                {t('ECONOMIC_BALANCE.SUBVENCION_SIN')}
              </ToggleButton>
              <ToggleButton value="Individual">
                {t('ECONOMIC_BALANCE.SUBVENCION_INDIVIDUAL')}
              </ToggleButton>
              <ToggleButton value="Comunitaria">
                {t('ECONOMIC_BALANCE.SUBVENCION_COMUNITARIA')}
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Container>
      </>
    )
  }
}

export default SubvencionEU
