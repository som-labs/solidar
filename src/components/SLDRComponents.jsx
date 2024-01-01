import {
  Box,
  TextField,
  InputAdornment,
  TextareaAutosize,
  Checkbox,
  Typography,
  Tooltip,
} from '@mui/material'

import { styled } from '@mui/material/styles'
import { useTheme } from '@mui/material/styles'
import { useField } from 'formik'
import { useTranslation } from 'react-i18next'

function SLDRFooterBox({ children }) {
  const StyledBox = styled(Box)(() => ({
    display: 'flex',
    flexWrap: 'wrap',
    flexDirection: 'column',
    flex: 1,
    textAlign: 'center',
    justifyContent: 'center',
    backgroundColor: '#E5FFCC',
  }))
  return <StyledBox>{children}</StyledBox>
}

function SLDRInfoBox(props) {
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

//REVISAR: estos style no estan funcionando
const SLDRTooltip = ({ title, children, placement }) => {
  const ToolTipStyle = {
    textAlign: 'left',
    padding: '8px',
    borderColor: 'green',
    borderRadius: '4px',
    fontFamily: 'inherit', // Ensure that it inherits the font
    fontSize: 'inherit',
  }
  return (
    <Tooltip title={title} placement={placement} arrow sx={ToolTipStyle}>
      {children}
    </Tooltip>
  )
}

function SLDRInputField({ unit, object, MUIType, ...props }) {
  const [field, meta] = useField(props)
  const { t } = useTranslation()

  const defaultStyle = {
    textAlign: 'right',
    padding: '8px',
    borderColor: 'green',
    borderRadius: '4px',
    fontFamily: 'inherit', // Ensure that it inherits the font
    fontSize: 'inherit',
  }

  const finalStyle = { ...defaultStyle, ...props.sx }

  const sxFix = {
    variant: 'outlined',
    size: 'small',
    border: '1px solid',
    flex: 1,
  }

  if (MUIType !== 'Checkbox' && MUIType !== 'TextareaAutosize')
    sxFix.InputProps = {
      endAdornment: <InputAdornment position="start">{unit}</InputAdornment>,
      inputProps: {
        style: finalStyle,
      },
    }

  let sxFull = { ...sxFix, ...props }

  return (
    <>
      {MUIType === undefined && (
        <SLDRTooltip
          title={<Typography>{t(object + '.TOOLTIP.' + props.name)}</Typography>}
          placement="top"
        >
          <TextField {...field} {...sxFull} />
        </SLDRTooltip>
      )}
      {MUIType === 'TextareaAutosize' && (
        <SLDRTooltip
          title={<Typography>{t(object + '.TOOLTIP_' + props.name)}</Typography>}
          placement="top"
        >
          <TextareaAutosize {...field} {...sxFull} />
        </SLDRTooltip>
      )}

      {MUIType === 'Checkbox' && (
        <SLDRTooltip
          title={<Typography>{t(object + '.TOOLTIP_' + props.name)}</Typography>}
          placement="top"
        >
          <Checkbox {...field} {...sxFull} />
        </SLDRTooltip>
      )}
      {meta.error ? (
        <div style={{ color: 'red', display: 'inline' }}>{meta.error}</div>
      ) : null}
    </>
  )
}

export { SLDRFooterBox, SLDRInfoBox, SLDRInputField, SLDRTooltip }
