import React from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from  '@mui/material/Typography'
import Skeleton from  '@mui/material/Skeleton'
import Card from  '@mui/material/Card'
import CardContent from  '@mui/material/CardContent'
import CardActionArea from  '@mui/material/CardActionArea'
import { Link } from "react-router-dom"

export default function ArticleThumb(params) {
  const {url, title, excerpt, image} = params
  return <>
    <Card elevation={0} sx={{width: '12rem'}}>
      <CardActionArea {...(url?{component: Link, to: url, target:'_black'}:{})} >
        <CardContent>
          <Box sx={{display: 'flex', flexFlow: 'column', width: '10rem'}}>
            {image ? (
              <img src={image} width='160px' height='90px' style={{objectFit: 'cover'}}  />
              ):(
              <Skeleton variant="rectangular" animation={false} width='160px' height='90px' />
            )}
            <Typography variant="h6">{title}</Typography>
            <Typography variant="body1">{excerpt}</Typography>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  </>
}


