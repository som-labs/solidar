import React from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Skeleton from '@mui/material/Skeleton'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardActionArea from '@mui/material/CardActionArea'
import { Link } from 'react-router-dom'

export default function ToolSelector(params) {
  const { route, title, subtitle } = params
  return (
    <>
      <Card elevation={0}>
        <CardActionArea {...(route ? { component: Link, to: route } : {})}>
          <CardContent>
            <Box sx={{ display: 'flex', flexFlow: 'column', alignItems: 'center' }}>
              <Skeleton
                variant="rectangular"
                animation={false}
                width={360}
                height={370}
              />
              <Typography variant="h5" sx={{ textAlign: 'center' }}>
                {title}
              </Typography>
              <Typography variant="h6" sx={{ textAlign: 'center' }}>
                {subtitle}
              </Typography>
            </Box>
          </CardContent>
        </CardActionArea>
      </Card>
    </>
  )
}
