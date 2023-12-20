import { useState } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './App.css'
import './i18n/i18n'
import { useTranslation } from 'react-i18next'
import GlobalTheme from './components/GlobalTheme'
import TestPage from './components/TestPage'
import HomePage from './Home/Page'
import SimulatorPage from './Simulator/Page'
import AboutPage from './About/Page'
import NotFoundPage from './NotFound/Page'
import DialogProvider from './components/DialogProvider'
import { BasesContextProvider } from './Simulator/BasesContext'

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
  const { t, i18n } = useTranslation()
  const [count, setCount] = useState(0)

  return (
    <GlobalTheme>
      <DialogProvider>
        <BasesContextProvider>
          <RouterProvider router={router} />
        </BasesContextProvider>
      </DialogProvider>
    </GlobalTheme>
  )
}

export default App
