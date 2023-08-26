import { useState } from 'react'
import AppFrame from './components/AppFrame'
import GlobalTheme from './components/GlobalTheme'
import './App.css'
import './i18n/i18n'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'

function App() {
  const [count, setCount] = useState(0);
  return (
    <GlobalTheme>
      <AppFrame>
        <Box>
          <Button variant="outlined" onClick={() => setCount((count) => count + 1)}>count is {count}</Button>
        </Box>
      </AppFrame>
    </GlobalTheme>
  );
}

export default App
