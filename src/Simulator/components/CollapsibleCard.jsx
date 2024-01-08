import React, { useState } from 'react'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Collapse from '@mui/material/Collapse'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

const CollapsibleCard = (props) => {
  const [expanded, setExpanded] = useState(true)

  // const [title, setTitle] = useState(content.title)
  // const [description, setDescription] = useState(content.description)
  const handleExpandClick = () => {
    setExpanded(!expanded)
  }
  return (
    <Card>
      <CardHeader
        title={props.title}
        sx={props.titleSX}
        action={
          <IconButton
            aria-expanded={expanded}
            aria-label="show more"
            onClick={handleExpandClick}
          >
            <ExpandMoreIcon />
          </IconButton>
        }
      />

      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent variant="outlined">
          <Typography
            variant={props.descriptionVariant}
            sx={props.descriptionSX}
            dangerouslySetInnerHTML={{
              __html: props.description,
            }}
          />
        </CardContent>
      </Collapse>
    </Card>
  )
}

export default CollapsibleCard
