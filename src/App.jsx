import { lazy, Suspense } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './i18n/i18n'

const SimulatorPage = lazy(() => import('./Simulator/Page'))
const AboutPage = lazy(() => import('./About/Page'))
const NotFoundPage = lazy(() => import('./NotFound/Page'))

import GlobalTheme from './components/GlobalTheme'
import DialogProvider from './components/DialogProvider'
import { AlertProvider } from './Simulator/components/Alert'

import { GlobalContextProvider } from './Simulator/GlobalContext'
import { BasesContextProvider } from './Simulator/BasesContext'
import { ConsumptionContextProvider } from './Simulator/ConsumptionContext'
import { EnergyContextProvider } from './Simulator/EnergyContext'
import { EconomicContextProvider } from './Simulator/EconomicContext'

const routes = [
  {
    path: '*',
    element: <NotFoundPage />,
  },
  {
    path: '/',
    element: <SimulatorPage />,
  },
  {
    path: '/simulator',
    element: <SimulatorPage />,
  },
  {
    path: '/about',
    element: <AboutPage />,
  },
]

const router = createBrowserRouter(routes)
function App() {
  /* Orden de providers:
     - El AlertProvider de main usa useDialog(), asi que va dentro de un DialogProvider.
     - BasesContext (colectivo) usa SLDRAlert, asi que AlertProvider tiene que estar por encima de el.
     - Los dialogos abiertos desde los componentes deben ver todos los contextos, por eso el
       DialogProvider interior (el que usan los componentes con useDialog) va debajo de todos ellos.
     SLDRAlert abre siempre en el DialogProvider exterior (su contenido es solo texto). */
  return (
    <GlobalTheme>
      <DialogProvider>
        <AlertProvider>
          <GlobalContextProvider>
            <BasesContextProvider>
              <ConsumptionContextProvider>
                <EnergyContextProvider>
                  <EconomicContextProvider>
                    <DialogProvider>
                      <Suspense fallback={'Loading...'}>
                        <RouterProvider router={router} />
                      </Suspense>
                    </DialogProvider>
                  </EconomicContextProvider>
                </EnergyContextProvider>
              </ConsumptionContextProvider>
            </BasesContextProvider>
          </GlobalContextProvider>
        </AlertProvider>
      </DialogProvider>
    </GlobalTheme>
  )
}

export default App
