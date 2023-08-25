import { useState } from 'react';
import './App.css';
import AppFrame from './components/AppFrame';
import './i18n/i18n'


function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <AppFrame>
        <div className="card">
          <button onClick={() => setCount((count) => count + 1)}>count is {count}</button>
          <p>
            Edit <code>src/App.jsx</code> and save to test HMR
          </p>
        </div>
        <p className="read-the-docs">Click on the Vite and React logos to learn more</p>
      </AppFrame>
    </>
  );
}

export default App;
