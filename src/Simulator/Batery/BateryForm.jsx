import { useState, Fragment } from 'react'
import { Formik, Form } from 'formik'
import { useTranslation } from 'react-i18next'
import { useContext, useEffect } from 'react'

// MUI objects
import {
  Button,
  Box,
  Grid,
  InputLabel,
  Container,
  Typography,
  Stack,
} from '@mui/material'

import { useTheme } from '@mui/material/styles'

//React global components
import { SLDRInfoBox, SLDRInputField } from '../../components/SLDRComponents'
import { EconomicContext } from '../EconomicContext'
import { AlertContext } from '../components/Alert'
// Solidar objects
import PreparaEnergyBalance from '../EnergyBalance/PreparaEnergyBalance'
import calculaResultados from '../classes/calculaResultados'
import Bateria from '../classes/Bateria'
import { decimalSeparator } from '../classes/Utiles'
import TCB from '../classes/TCB'

// ── Presets de baterías comunes ──────────────────────────────────────────────
const PRESETS = [
  {
    label: 'Tesla Powerwall 2',
    values: {
      capacidad: 13.5,
      socMax: 0.95,
      socMin: 0.05,
      eficiencia: 0.9,
      maxCargaKw: 5,
      maxDescargaKw: 5,
    },
  },
  {
    label: 'BYD HVS 10',
    values: {
      capacidad: 10.2,
      socMax: 0.95,
      socMin: 0.1,
      eficiencia: 0.95,
      maxCargaKw: 5,
      maxDescargaKw: 5,
    },
  },
  {
    label: 'Sonnen Eco 8',
    values: {
      capacidad: 8,
      socMax: 0.9,
      socMin: 0.1,
      eficiencia: 0.92,
      maxCargaKw: 3.3,
      maxDescargaKw: 3.3,
    },
  },
]

// ── Subcomponente: campo numérico con label, hint y error ────────────────────
function Campo({ label, name, formik, unidad }) {
  const { t, i18n } = useTranslation()
  const error = formik.touched[name] && formik.errors[name]
  const touched = formik.touched[name]
  const valid = touched && !formik.errors[name]
  const separador = (1.1).toLocaleString().substring(1, 2)

  return (
    <Fragment key={name}>
      <InputLabel htmlFor={name}>{label}</InputLabel>

      <SLDRInputField
        object={'Bateria'}
        id={name}
        name={name}
        onBlur={formik.handleBlur}
        unit={unidad}
        value={String(formik.values[name] ?? '').replace('.', separador)}
        onChange={(e) => {
          const crudo = e.target.value
          const normalizado = crudo.replace(decimalSeparator, '.')
          formik.setFieldValue(name, normalizado)
        }}
      />
    </Fragment>
  )
}

// ── Componente principal ─────────────────────────────────────────────────────
/**
 * BateriaForm
 *
 * Props:
 *   onGuardar(valores)  — callback con los parámetros de la batería validados
 *   onEliminar()        — callback para quitar la batería del sistema
 *   valorInicial        — si ya hay una batería configurada, la precarga
 */
export default function BateriaForm({
  bateriaInicial,
  setBateriaValida,
  setBateria,
  nuevaBateria,
}) {
  const { t } = useTranslation()
  const theme = useTheme()
  const { ecoData, setEcoData } = useContext(EconomicContext)
  const { SLDRAlert } = useContext(AlertContext)

  function validar(values) {
    const errors = {}

    Object.entries(values).forEach(([campo, valor]) => {
      const idCampo = Bateria.CAMPOS.find((p) => p.name === campo)

      if (idCampo) {
        if (valor === '' || valor === null) {
          errors[campo] = t('BASIC.LABEL_REQUIRED')
        } else if (isNaN(Number(valor))) {
          errors[campo] = t('BASIC.LABEL_NUMBER')
        } else if (valor < idCampo.min || valor > idCampo.max) {
          errors[campo] = t('Bateria.LABEL_RANGO', {
            campo: campo,
            min: idCampo.min,
            max: idCampo.max,
          })
        } else {
          TCB.bateria[campo] = Number(valor)
          setBateria((prev) => ({ ...prev, campo: valor }))

          // console.log('llamamos a preparar energía con', TCB.bateria)

          // console.log('resultados de preparar energía', results)
          // if (!results.status) {
          //   console.log(t('Rendimiento.MSG_BASE_SIN_RENDIMIENTO'), results.error)
          //   SLDRAlert(t('Rendimiento.MSG_BASE_SIN_RENDIMIENTO'), results.error, 'Error')
          // }
        }
      }
    })

    if (Object.keys(errors).length === 0) {
      setBateriaValida(true)
      const results = calculaResultados()
    } else {
      setBateriaValida(errors)
    }
    return errors
  }

  async function aplicarPreset(preset, formik) {
    if (!preset.values) return // "Personalizada" — no resetea
    Object.entries(preset.values).forEach(([k, v]) => {
      const texto = String(v)
      formik.setFieldValue(k, texto)
    })
    // Limpiar errores previos
    formik.setErrors({})

    // Limpiar touched
    formik.setTouched({})

    // Esperar a que Formik procese los nuevos valores y validar
    const errors = await formik.validateForm(preset.values)
    if (Object.keys(errors).length === 0) {
      nuevaBateria(preset.values)
    }
  }

  return (
    <Formik
      initialValues={bateriaInicial}
      validate={async (values) => await validar(values)}
      validateOnChange={true}
      validateOnBlur={true}
      validateOnMount={true}
      onSubmit={() => {}} // Formik requiere onSubmit aunque no lo uses
    >
      {(formik) => {
        // Usable energy = capacidad × (socMax - socMin)
        const energiaUtil = formik.values.capacidad
          ? (
              formik.values.capacidad *
              (formik.values.socMax - formik.values.socMin)
            ).toFixed(1)
          : '—'

        return (
          <Form>
            <Container>
              <SLDRInfoBox>
                <Grid
                  container
                  rowSpacing={2}
                  justifyContent="center"
                  sx={{ display: 'flex', gap: 2 }}
                >
                  <Grid item xs={12} sx={{ mt: '2rem' }}>
                    <Typography sx={theme.titles.level_1} textAlign={'center'}>
                      {t('Bateria.TITLE_PRESET')}
                    </Typography>
                  </Grid>

                  {/* ── Botbos de preset ── */}
                  <Grid container columnSpacing={2}>
                    <Grid item xs={12} sx={{ mb: '2rem' }} textAlign={'center'}>
                      <Typography sx={theme.titles.level_2}>
                        {t('Bateria.TITLE_PRESET_MODELS')}
                      </Typography>

                      {/* ── Presets ── */}
                      <Stack direction="row" spacing={2} justifyContent="center">
                        {PRESETS.map((p) => (
                          <Button
                            variant="contained"
                            key={p.label}
                            type="button"
                            size="small"
                            onClick={() => aplicarPreset(p, formik)}
                          >
                            {p.label}
                          </Button>
                        ))}
                      </Stack>
                    </Grid>

                    <Grid item xs={12}>
                      <Box
                        sx={{
                          display: 'flex',
                          width: '100%',
                          gap: '15px',
                        }}
                      >
                        <SLDRInfoBox sx={{ borderTop: '3px solid #96b633' }}>
                          <Box sx={{ mb: '1rem' }}>
                            <Typography fontWeight="bold" sx={{ mt: '1rem', mb: '1rem' }}>
                              {t('Bateria.TITLE_SECTION_CAPACIDAD')}
                            </Typography>
                            <Campo
                              label={t('Bateria.PROP.capacidad')}
                              name="capacidad"
                              formik={formik}
                              unidad="kWh"
                            />
                            <Typography sx={{ mt: '1rem' }}>
                              ⚡ Energía útil estimada: <strong>{energiaUtil} kWh</strong>
                            </Typography>
                            <span> capacidad × (SOC máx − SOC mín)</span>
                          </Box>
                        </SLDRInfoBox>

                        <SLDRInfoBox sx={{ borderTop: '3px solid #96b633' }}>
                          <Box>
                            <Typography fontWeight="bold" sx={{ mt: '1rem', mb: '1rem' }}>
                              {t('Bateria.TITLE_SECTION_SOC')}
                            </Typography>
                            <Campo
                              label="SOC máximo"
                              name="socMax"
                              formik={formik}
                              min={0.1}
                              max={1}
                              step={0.01}
                              unidad="(0–1)"
                              hint="Límite superior de carga"
                            />
                            <Campo
                              label="SOC mínimo"
                              name="socMin"
                              formik={formik}
                              min={0}
                              max={0.9}
                              step={0.01}
                              unidad="(0–1)"
                              hint="Reserva mínima, no se descarga por debajo"
                            />
                          </Box>
                        </SLDRInfoBox>
                      </Box>
                    </Grid>

                    <Grid item xs={12}>
                      <Box
                        sx={{
                          display: 'flex',
                          width: '100%',
                          gap: '15px',
                        }}
                      >
                        <SLDRInfoBox sx={{ borderTop: '3px solid #96b633' }}>
                          <Box>
                            <Typography fontWeight="bold" sx={{ mt: '1rem', mb: '1rem' }}>
                              {t('Bateria.TITLE_SECTION_RENDIMIENTO')}
                            </Typography>
                            <Campo
                              label={t('Bateria.PROP.eficiencia')}
                              name="eficiencia"
                              formik={formik}
                              unidad="(0–1)"
                            />
                          </Box>
                        </SLDRInfoBox>

                        <SLDRInfoBox sx={{ borderTop: '3px solid #96b633' }}>
                          <Box>
                            <Typography fontWeight="bold" sx={{ mt: '1rem', mb: '1rem' }}>
                              {t('Bateria.TITLE_SECTION_POTENCIA')}
                            </Typography>
                            <Campo
                              label="Carga máxima"
                              name="maxCargaKw"
                              formik={formik}
                              unidad="kW"
                              hint="Potencia máxima de entrada"
                            />
                            <Campo
                              label="Descarga máxima"
                              name="maxDescargaKw"
                              formik={formik}
                              unidad="kW"
                              hint="Potencia máxima de salida"
                            />
                          </Box>
                        </SLDRInfoBox>
                      </Box>
                    </Grid>
                  </Grid>
                </Grid>
              </SLDRInfoBox>
            </Container>
          </Form>
        )
      }}
    </Formik>
  )
}
