import { useState } from 'react'
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import './App.css'
import './i18n/i18n'
import { useTranslation } from 'react-i18next'
import AppFrame from './components/AppFrame'
import GlobalTheme from './components/GlobalTheme'
import HomePage from './Home/Page'
import SimulatorPage from './Simulator/Page'
import AboutPage from './About/Page'

const routes = [
  {
    path: '/',
    element: <AppFrame><HomePage/></AppFrame>,
  },
  {
    path: '/simulator',
    element: <AppFrame><SimulatorPage/></AppFrame>,
  },
  {
    path: '/about',
    element: <AppFrame><AboutPage/></AppFrame>,
  },
]

const router = createBrowserRouter(routes)

function App() {
  const {t, i18n} = useTranslation()
  const [count, setCount] = useState(0)

  return (
    <GlobalTheme>
      <RouterProvider router={router} />
    </GlobalTheme>
  )
}

export default App
