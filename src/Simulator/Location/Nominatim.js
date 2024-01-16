// Solidar global modules
import TCB from '../classes/TCB'
import * as UTIL from '../classes/Utiles'

/** Vamos a verificar si el punto dado esta en España
  Devuelve false si no lo esta o alguno de los siguientes valores en caso de estar en España
  ['Peninsula', 'Islas Baleares', 'Canarias', 'Melilla', 'Ceuta']
 * 
 * @param {array} point [Latitud, Longitud]
 * @returns false si no esta en España
 * @returns true si el punto esta en territorio español
 */
export default async function verificaTerritorio(point) {
  const { status, details } = await verificaTerritorioNominatim(point)

  if (status !== 'success') {
    return { status: status, territorio: details }
  } else {
    //Verificamos que la base creada esta en el mismo territorio si es que ya habia otras creadas.
    console.log(TCB.territorio, details.zona)
    if (TCB.territorio !== null && TCB.territorio !== details.zona) {
      return { status: 'noSameTerritory', territorio: details }
      //   SLDRAlert('VALIDACION', t('LOCATION.ERROR_MISMO_TERRITORIO'), 'error')
      //   return false
    } else {
      TCB.territorio = details.zona
      return { status: 'success', territorio: details }
    }
  }
}

/**
 * Realiza la llamada a Nominatim para determinar el territorio donde se encuentra point
 * @param {array} point [Latitud, Longitud]
 * @returns null si el territorio no es España
 * @returns false en caso de error en la llamada Nominatim
 * @returns territorio entre los siguientes valores: ['Peninsula', 'Illes Balears', 'Canarias', 'Melilla', 'Ceuta'];
 */
async function verificaTerritorioNominatim(point) {
  let returnCode
  let url =
    'https://nominatim.openstreetmap.org/reverse?lat=' +
    point[1].toFixed(4) +
    '&lon=' +
    point[0].toFixed(4) +
    "&format=geocodejson&zoom=18&accept-language='es'"
  UTIL.debugLog('Call reverse Nominatim :' + url)
  try {
    const respTerritorio = await fetch(url)
    if (respTerritorio.status === 200) {
      let datoTerritorio = await respTerritorio.text()

      let jsonTerritorio = JSON.parse(datoTerritorio)
      if (jsonTerritorio['error'] !== undefined) {
        throw jsonTerritorio['error']
      }

      UTIL.debugLog('El punto esta en:', jsonTerritorio)
      let localizacion = jsonTerritorio.features[0].properties.geocoding
      if (localizacion.country === 'España') {
        // Verificamos si estamos en territorio insular.
        let territorio = 'Peninsula'
        let detalle = localizacion.state
        const islas = ['Illes Balears', 'Canarias', 'Melilla', 'Ceuta']
        if (detalle == undefined) detalle = localizacion.city //Para Ceuta y Melilla Nominatim no devuelve state pero usamos city.
        if (islas.includes(detalle)) territorio = detalle
        UTIL.debugLog('Localización:' + territorio)
        returnCode = {
          status: 'success',
          details: {
            zona: territorio,
            calle: localizacion.street,
            ciudad: localizacion.city,
          },
        }
      } else {
        UTIL.debugLog('Localización erronea:' + localizacion.country)
        returnCode = { status: 'countryFailure', details: localizacion.country }
      }
    } else {
      returnCode = { status: 'fetchReturnError', details: respTerritorio }
    }
  } catch (err) {
    console.log(err)
    returnCode = { status: 'tryError', details: err }
  }
  return returnCode
}

export {}
