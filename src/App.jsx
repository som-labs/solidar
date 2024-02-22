import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './App.css'
import './i18n/i18n'

import GlobalTheme from './components/GlobalTheme'
import TestPage from './components/TestPage'
import HomePage from './Home/Page'
import SimulatorPage from './Simulator/Page'
import AboutPage from './About/Page'
import NotFoundPage from './NotFound/Page'
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
    element: <HomePage />,
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
      <BasesContextProvider>
        <ConsumptionContextProvider>
          <EconomicContextProvider>
            <DialogProvider>
              <AlertProvider>
                <RouterProvider router={router} />
              </AlertProvider>
            </DialogProvider>
          </EconomicContextProvider>
        </ConsumptionContextProvider>
      </BasesContextProvider>
    </GlobalTheme>
  )
}

export default App
