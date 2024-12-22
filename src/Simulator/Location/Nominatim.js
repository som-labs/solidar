import { useContext } from 'react'

import { ConsumptionContext } from '../ConsumptionContext'

// Solidar global modules
import TCB from '../classes/TCB'
import * as UTIL from '../classes/Utiles'
import Finca from '../classes/Finca'

/** Vamos a verificar si el punto dado esta en España
  Devuelve false si no lo esta o alguno de los siguientes valores en caso de estar en España
  ['Peninsula', 'Islas Baleares', 'Canarias', 'Melilla', 'Ceuta']
 * 
 * @param {array} point [Latitud, Longitud]
 * @returns false si no esta en España
 * @returns true si el punto esta en territorio español
 */
async function verificaTerritorio(point) {
  try {
    const { status, details } = await verificaTerritorioNominatim(point)
    if (status !== 'success') {
      return { status: status, details: details }
    } else {
      //Check new base is in Spain
      if (details.country === 'España') {
        // Verificamos si estamos en territorio insular o no.
        //Para Ceuta y Melilla Nominatim no devuelve state pero usamos city.
        let detalle = details.zona ?? details.city
        // Verify if it is in other spanish territory. Needed for REE consumption type
        const islas = ['Illes Balears', 'Canarias', 'Melilla', 'Ceuta']
        if (islas.includes(detalle)) details.zona = detalle
        else details.zona = 'Peninsula'

        //Verificamos que la base creada esta en el mismo territorio si es que ya habia otras creadas.
        if (TCB.territorio !== null && TCB.territorio !== details.zona) {
          return { status: 'noSameTerritory', details: details }
        } else {
          TCB.territorio = details.zona
          return { status: 'success', details: details }
        }
      } else {
        // El punto no esta en España
        UTIL.debugLog('Localización erronea:' + details.country)
        return { status: 'countryFailure', details: details.country }
      }
    }
  } catch (error) {
    return error
  }
}

/**
 * Call Nominatim service to get details where the point is
 * @param {array} point [Latitud, Longitud]
 * @property {string} status [success if OK, ]
 * @property {object} details
 * @returns null si el territorio no es España
 * @returns false en caso de error en la llamada Nominatim
 * @returns territorio entre los siguientes valores: ['Peninsula', 'Illes Balears', 'Canarias', 'Melilla', 'Ceuta'];
 */
async function verificaTerritorioNominatim(point) {
  let url =
    'https://nominatim.openstreetmap.org/reverse?lat=' +
    point[1].toFixed(4) +
    '&lon=' +
    point[0].toFixed(4) +
    "&format=geocodejson&zoom=18&accept-language='es'&addressdetails=1"
  UTIL.debugLog('Call reverse Nominatim :' + url)
  try {
    return new Promise((resolve, reject) => {
      fetch(url)
        .then((respNominatim) => {
          if (!respNominatim.ok) {
            // This is a network error
            reject({ status: 'fetchReturnError', details: respNominatim })
          } else {
            return respNominatim.json()
          }
        })
        .then((jsonNominatim) => {
          if (jsonNominatim['error'] !== undefined) {
            reject({ status: 'nominatimError', details: jsonNominatim['error'] })
          } else {
            return jsonNominatim
          }
        })
        .then((jsonTerritorio) => {
          UTIL.debugLog('El punto esta en:', jsonTerritorio)
          let localizacion = jsonTerritorio.features[0].properties.geocoding
          UTIL.debugLog('Localización:' + localizacion)
          resolve({
            status: 'success',
            details: {
              country: localizacion.country,
              zona: localizacion.state,
              calle: localizacion.street,
              ciudad: localizacion.city,
              direccion: localizacion.label,
            },
          })
        })
        .catch((error) => {
          reject({ status: 'tryError', details: error })
        })
    })
  } catch {
    console.log('error incontrolado')
  }
}

/**
 * Devuelve datos de la parcela mas cercana al punto dado
 * @param {Array(2)<Number>} punto en coordenadas sistema geografico EPSG:4326
 * @returns {JSON} Devuelve objeto JSON de catastro con:
 *  'codigo' => 0 si no hay error, <0 en caso de error
 *  'refcat' => referencia catastral mas cercana a las coordenadas dadas,
 *  'direccion' => dirección de la parcela;
 *  'descripcion' => solo en caso de codigo <0
 *  'units' => array de Fincas
 */
async function getParcelaXY(punto) {
  let url = TCB.basePath + 'proxy-Catastro-refcat x lonlat.php?'
  url += 'coorX=' + punto[0] + '&coorY=' + punto[1]
  UTIL.debugLog('Consulta_RCCOOR :' + url)

  let template = { parcela: {}, units: [], status: true, error: '' }
  let errorMessage = ''

  try {
    const respuesta = await fetch(url)
    if (respuesta.status === 200) {
      let datoRC = await respuesta.json()
      if (datoRC.codigo !== 0) {
        return { status: false, error: datoRC.descripcion }
      }
      template.parcela = datoRC
    }
  } catch (err) {
    errorMessage = TCB.i18next.t('catastro_MSG_errorFetch', {
      err: err.message,
      url: url,
    })
    return { status: false, error: errorMessage }
  }

  //Carga las fincas dependientes de cada punto de consumo con la llamada al catastro
  url =
    TCB.basePath + 'proxy-Catastro-detalle x refcat.php?refcat=' + template.parcela.refcat
  url += '&idSesion=' + TCB.idSesion

  try {
    const responseFincas = await fetch(url)
    UTIL.debugLog('Catastro ->' + url)
    if (responseFincas.status === 200) {
      let jsonFincas = await responseFincas.json()

      TCB.participacionTotal = 0
      for (let unaFinca of jsonFincas) {
        //NOTA:Temporalmente asignamos idFinca como CUPS
        unaFinca.CUPS = 'CUPS de ' + TCB.idFinca

        unaFinca.idFinca = TCB.idFinca++
        unaFinca.grupo = Finca.mapaUsoGrupo[unaFinca.uso]
        const _len = template.units.push(new Finca(unaFinca))
        TCB.participacionTotal += template.units[_len - 1].participacion
      }
      console.log(
        'Participacion total según DGC: ' + UTIL.round2Decimales(TCB.participacionTotal),
      )
      UTIL.debugLog('Participacion total según DGC: ' + TCB.participacionTotal)
      template.status = true
      template.error = ''
      return template
    } else {
      template.status = false
      template.error =
        'Error obteniendo datos de catastro ' + responseFincas.status + '\n' + url
      return template
    }
  } catch (err) {
    template.status = false
    template.error = 'Error obteniendo datos de catastro ' + err + '\n' + url
    return template
  }
}

export { getParcelaXY, verificaTerritorio }
