import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import AppFrame from '../components/AppFrame'
import { Paper, Button } from '@mui/material'
import SimulatorPage from '../Simulator/Page'

export default function Page() {
  const { t } = useTranslation()
  const [showComponent, setShowComponent] = useState(false)

  const handleOpenComponent = () => {
    setShowComponent(true)
  }

  return (
    <>
      {!showComponent ? (
        <AppFrame>
          <Paper elevation={4} sx={{ padding: 4, margin: 2 }}>
            <h1>¿Qué es Solidar Energía?</h1>
            <p>
              Solidar Energia es una aplicación para ayudarte a estimar el número
              razonable de paneles a instalar, el ahorro energético y económico que
              obtendrías y el coste aproximado de un proyecto de instalación fotovoltaica
              sin baterías a partir de los precios de la electricidad y del consumo
              horario de un suministro eléctrico individual: una vivienda, un local
              comercial, las zonas comunes de una comunidad de propietarios, un garaje,
              etc.{' '}
            </p>
            <p>
              Podrás alterar a voluntad el número recomendado de paneles, su potencia y
              precio para comprobar cómo varían las estimaciones hechas y guardar los
              resultados en un informe. No obstante, el uso de Solidar Energía entraña
              ciertos requisitos:
            </p>
            <ol>
              <li>conocimientos básicos sobre la energía fotovoltaica </li>
              <li>
                determinar la ubicación geográfica exacta donde se realizará la
                instalación (se utiliza un mapa para ello)
              </li>
              <li>
                los precios de la electricidad que la compañía comercializadora te cobra
                por el suministro sobre el que se quiere simular la instalación
                fotovoltaica
              </li>
              <li>
                descargarse de la compañía distribuidora un fichero con los consumos
                horarios de electricidad de un año (enseñamos cómo hacerlo, es bastante
                fácil) o al menos conocer el consumo anual estimado para utilizar el
                perfil medio de REE
              </li>
            </ol>
            <p>
              Otros datos no imprescindibles que contribuyen a obtener resultados más
              certeros son:
            </p>
            <ol>
              <li>la orientación respecto al sur geográfico (acimut) de los paneles </li>
              <li>
                la inclinación de la superficie sobre la que se instalarán los paneles
              </li>
            </ol>
            <p>
              Solidar consta de varias pestañas organizadas de izquierda a derecha donde
              rellenarás información imprescindible para poder avanzar a la pestaña
              siguiente al pulsar la flecha en el margen superior derecho. Los usuarios
              más avanzados podrán modificar varios parámetros asumidos en la simulación
              si lo desearan (tecnología del panel, su potencia, IVA, pérdidas de la
              instalación,…).
            </p>
            <p>
              Utiliza el icono del sobre (en la parte superior derecha de la pantalla)
              para hacernos saber errores, mejoras o sugerencias y así poder perfeccionar
              y acomodar Solidar Energía al uso que se haga de ella.
            </p>
            <p>
              Si bien para las estimaciones energéticas se procura la mayor precisión
              posible gracias a Photovoltaic Geographical Information System de la
              Comisión Europea, el coste de la instalación sufre mayores fluctuaciones y,
              aunque pretendemos tener precios actualizados, podrán diferir del precio
              dado por una empresa. Todas estas proyecciones las ofrecemos con la mejor
              intención y sin ningún compromiso. Som Energia no tiene ningún interés
              económico ni directo ni indirecto en este estudio salvo contribuir a una
              transición energética justa con los usuarios, eficiente, descentralizada y
              limpia.
            </p>
            <Button variant="contained" size="large" onClick={handleOpenComponent}>
              {t('REPORT.RETURN')}
            </Button>
          </Paper>
        </AppFrame>
      ) : (
        <SimulatorPage />
      )}
    </>
  )
}
