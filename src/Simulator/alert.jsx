import React, { useState } from 'react'

function myAlert(message, type) {
  const [alert, setAlert] = useState({ message: '', type: '' })

  // Function to show an alert
  const showAlert = (message, type) => {
    setAlert({ message, type })
  }

  // Function to hide the alert
  const hideAlert = () => {
    setAlert({ message: '', type: '' })
  }

  return (
    <div>
      {alert.message && (
        <div className={`alert ${alert.type}`}>
          <p>{alert.message}</p>
          <button onClick={hideAlert}>Close</button>
        </div>
      )}

      {/* Your application content here */}
    </div>
  )
}
export default myAlert
