import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

import InicializaAplicacion from './Simulator/classes/InicializaAplicacion'

/*REVISAR: Se supone que esta llamada asincrona deberia resolver la inicializacion de la TCB antes de los contextos pero no funciona
Simplemente await InicializaAplicacion() funciona bien pero a node no le gusta con el error:
ERROR: Top-level await is not available in the configured target environment ("chrome87", "edge88", "es2020", "firefox78", "safari14" + 3 overrides)
*/
async function main() {
  await InicializaAplicacion()
}
main()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
