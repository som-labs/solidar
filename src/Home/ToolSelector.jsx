import { Box, Typography, Card, CardContent, CardActionArea } from '@mui/material'
import Skeleton from '@mui/material/Skeleton'
import { Link } from 'react-router-dom'

export default function ToolSelector(params) {
  const { route, title, subtitle, icon: Icon, image } = params
  return (
    <>
      <Card elevation={0}>
        <CardActionArea
          {...(route ? { component: Link, to: route } : {})}
          sx={{
            color: 'primary.main',
            transition: '.2s',
            '&:hover': {
              color: 'secondary.main',
              transition: '.2s',
            },
          }}
        >
          <CardContent>
            <Box sx={{ display: 'flex', flexFlow: 'column', alignItems: 'center' }}>
              {Icon ? (
                <Icon sx={{ fontSize: 'clamp(150px, 30vw, 400px)' }} />
              ) : (
                <div>
                  <img src={image} width="400" height="400" alt="SVG Image" />
                </div>
                /*  <Skeleton
                  variant="rectangular"
                  animation={false}
                  width={360}
                  height={370}
                /> */
              )}
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
