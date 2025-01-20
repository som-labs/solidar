import { useState, useMemo, useRef, useEffect, useContext, useCallback } from 'react'
import { debounce } from '@mui/material/utils'
import { useTranslation } from 'react-i18next'

// OpenLayers objects
import { fromLonLat } from 'ol/proj'

// MUI objects
import { TextField, Autocomplete } from '@mui/material'

// REACT Solidar Components
import { BasesContext } from '../BasesContext'
import { useAlert } from '../../components/AlertProvider.jsx'

// Solidar objects
import * as UTIL from '../classes/Utiles'

export default function AddressSearch() {
  const { t } = useTranslation()
  const { SLDRAlert } = useAlert()

  const { map } = useContext(BasesContext)
  // Address search states
  const [address, setAddress] = useState('')
  const [candidatos, setCandidatos] = useState([])

  const findAddress = useCallback(async () => {
    setCandidatos([])
    let url =
      'https://nominatim.openstreetmap.org/search?format=json&polygon_geojson=1&addressdetails=1&countrycodes=es&'
    url += 'q=' + address
    UTIL.debugLog('Call Nominatim:' + url)

    try {
      const respCandidatos = await fetch(url)
      if (respCandidatos.status === 200) {
        var dataCartoCiudad = await respCandidatos.text()
        var jsonAdd = JSON.parse(dataCartoCiudad)
        var nitem = []
        jsonAdd.forEach(function (item, index) {
          nitem.push({
            value: [item.lon, item.lat],
            text: item.display_name.toString(),
            key: index,
          })
        })
        setCandidatos([...nitem])
      } else {
        SLDRAlert(
          'VALIDACION',
          t('ERROR_NOMINATIM_FETCH', {
            err: 'Status: ' + respCandidatos.status,
            url: url,
          }),
          'Error',
        )
        return false
      }
    } catch (err) {
      SLDRAlert(
        'VALIDACION',
        t('ERROR_NOMINATIM_FETCH', { err: err.message, url: url }),
        'Error',
      )
      return false
    }
  }, [address, t])

  const ref = useRef()

  useEffect(() => {
    ref.current = findAddress
  }, [findAddress])

  const debouncedCallback = useMemo(() => {
    const func = () => {
      ref.current?.()
    }
    return debounce(func, 500)
  }, [])

  return (
    <>
      <Autocomplete
        options={candidatos}
        filterOptions={(x) => x}
        autoComplete
        // Only to show it in components SLDRInfoBox boundary. To be removed
        sx={{ width: '100%', mt: '0.5rem', mb: '0.5rem' }}
        onChange={(ev, value) => {
          if (value !== null) {
            map.getView().setCenter(fromLonLat(value.value))
            setAddress(null)
          }
          setCandidatos([])
        }}
        onInputChange={(ev) => {
          //When using the clean option of the field there is not value prop
          const ll = ev.target.value?.length ?? 0
          if (ll > 3) {
            setAddress(ev.target.value)
            debouncedCallback()
          }
        }}
        getOptionLabel={(option) => option.text}
        renderInput={(params) => (
          <TextField
            {...params}
            label={t('LOCATION.PROMPT_ADDRESS')}
            fullWidth
            style={{ width: '100%' }}
          />
        )}
      />
    </>
  )
}
