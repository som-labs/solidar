import { Box, TextField, InputAdornment } from '@mui/material'
import { styled } from '@mui/material/styles'
import { useTheme } from '@mui/material/styles'
import { useField } from 'formik'

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

// function InputNumber({ children }) {
//   const StyledField = styled(Input)(() => ({
//     textAlign: 'right',
//     backgroundColor: 'aquamarine',
//     variant: 'outlined',
//   }))
//   return <StyledField>{children}</StyledField>
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

function InputField({ unit, ...props }) {
  const theme = useTheme()
  const [field, meta] = useField(props)
  let sxFix = {
    variant: 'outlined',
    size: 'small',

    //style: { width: '100px' },
    InputProps: {
      endAdornment: <InputAdornment position="end">{unit}</InputAdornment>,
      inputProps: {
        style: {
          textAlign: 'right',
          border: '1px solid',
          borderColor: 'green',
          // Set border style and color
          borderRadius: '4px', // Optional: Adjust border radius for rounded corners
          padding: '8px', // Optional: Adjust padding for content spacing
        },
      },
    },
  }

  let sxFull = { ...sxFix, ...props }
  return (
    <>
      <TextField {...field} {...sxFull} />
      {meta.error ? (
        <div style={{ color: 'red', display: 'inline' }}>{meta.error}</div>
      ) : null}
    </>
  )
}

export { FooterBox, InfoBox, InputField }
3
