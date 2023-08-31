import React from 'react'
import Typography from '@mui/material/Typography'

export function Header({ children }) {
  return (
    <Typography variant="h3" sx={{ my: 4 }}>
      {children}
    </Typography>
  )
}

export function BrochureP({ children }) {
  return (
    <Typography variant="brochureP" sx={{ my: 1 }}>
      {children}
    </Typography>
  )
}
