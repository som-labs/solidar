import { lazy, Suspense } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './i18n/i18n'

const SimulatorPage = lazy(() => import('./Simulator/Page'))
const AboutPage = lazy(() => import('./About/Page'))
const NotFoundPage = lazy(() => import('./NotFound/Page'))

import GlobalTheme from './components/GlobalTheme'
import DialogProvider from './components/DialogProvider'
import { BasesContextProvider } from './Simulator/BasesContext'
import { ConsumptionContextProvider } from './Simulator/ConsumptionContext'
import { EconomicContextProvider } from './Simulator/EconomicContext'
import { AlertProvider } from './Simulator/components/Alert'

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
  return (
    <GlobalTheme>
      <BasesContextProvider>
        <ConsumptionContextProvider>
          <EconomicContextProvider>
            <DialogProvider>
              <AlertProvider>
                <Suspense fallback={'Loading...'}>
                  <RouterProvider router={router} />
                </Suspense>
              </AlertProvider>
            </DialogProvider>
          </EconomicContextProvider>
        </ConsumptionContextProvider>
      </BasesContextProvider>
    </GlobalTheme>
  )
}

export default App
