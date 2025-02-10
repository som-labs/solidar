import { lazy, Suspense } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './App.css'
import './i18n/i18n'
import InicializaAplicacion from './Simulator/classes/InicializaAplicacion'

const TestPage = lazy(() => import('./components/TestPage'))
const HomePage = lazy(() => import('./Home/Page'))
const SimulatorPage = lazy(() => import('./Simulator/Page'))
const AboutPage = lazy(() => import('./About/Page'))
const NotFoundPage = lazy(() => import('./NotFound/Page'))

import GlobalTheme from './components/GlobalTheme'
import DialogProvider from './components/DialogProvider'
import { BasesContextProvider } from './Simulator/BasesContext'
import { ConsumptionContextProvider } from './Simulator/ConsumptionContext'
import { EconomicContextProvider } from './Simulator/EconomicContext'
//import { AlertProvider } from './Simulator/components/Alert'
import { AlertProvider } from './components/AlertProvider'
import { GlobalContextProvider } from './Simulator/GlobalContext'

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
  {
    path: '/test',
    element: <TestPage />,
  },
]

const router = createBrowserRouter(routes)
function App() {
  return (
    <GlobalTheme>
      <GlobalContextProvider>
        <AlertProvider>
          <BasesContextProvider>
            <ConsumptionContextProvider>
              <EconomicContextProvider>
                <DialogProvider>
                  <Suspense fallback={'Loading...'}>
                    <RouterProvider router={router} />
                  </Suspense>
                </DialogProvider>
              </EconomicContextProvider>
            </ConsumptionContextProvider>
          </BasesContextProvider>
        </AlertProvider>
      </GlobalContextProvider>
    </GlobalTheme>
  )
}

export default App
