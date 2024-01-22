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
    "&format=geocodejson&zoom=18&accept-language='es'"
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
