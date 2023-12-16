import { Box, Grid } from '@mui/material'
import { styled } from '@mui/material/styles'
import { useTheme } from '@mui/material/styles'

function FooterBox({ children }) {
  const StyledBox = styled(Box)(() => ({
    display: 'flex',
    flexWrap: 'wrap',
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#E5FFCC',
  }))
  return <StyledBox>{children}</StyledBox>
}

// function InfoBox({ children }) {
//   const StyledBox = styled(Box)(() => ({
//     display: 'flex',
//     flexWrap: 'wrap',
//     flex: 1,
//     backgroundColor: '#E0FFCC',

//     border: '2px',
//     borderColor: 'primary.light',
//     borderRadius: 4,
//   }))
//   return <StyledBox>{children}</StyledBox>
// }

function InfoBox(props) {
  const theme = useTheme()

  let sxFix = {
    display: 'flex',
    flexWrap: 'wrap',
    flex: 1,
    backgroundColor: theme.palette.infoBox.main, //'#E0FFCC',
    borderRadius: 4,
    border: '2px solid',
    borderColor: 'primary.light',
    mb: '1rem',
    justifyContent: 'center',
  }
  let sxFull = { ...sxFix, ...props.sx }
  return (
    <>
      <Box sx={sxFull}>{props.children}</Box>
    </>
  )
}

export { FooterBox, InfoBox }
