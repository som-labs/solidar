import {
  Box,
  TextField,
  InputAdornment,
  TextareaAutosize,
  Checkbox,
  Typography,
  Tooltip,
} from '@mui/material'
//Formik
import { ErrorMessage } from 'formik'

//DEMO
import CollapsibleCard from '../Simulator/components/CollapsibleCard'

import { styled } from '@mui/material/styles'
import { useTheme } from '@mui/material/styles'
import { useField } from 'formik'
import { useTranslation } from 'react-i18next'

function SLDRFooterBox(props) {
  const defaultStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    flexDirection: 'column',
    flex: 1,
    textAlign: 'center',
    justifyContent: 'center',
  }

  const StyledBox = styled(Box)(() => ({
    ...defaultStyle,
    ...props.sx,
  }))

  return <StyledBox> {props.children}</StyledBox>
}

function SLDRInfoBox(props) {
  const theme = useTheme()

  // let sxFix = {
  //   display: 'flex',
  //   flexWrap: 'wrap',
  //   flex: 1,
  //   borderRadius: 0,
  //   border: '2px solid',
  //   borderColor: 'green',
  //   mb: '1rem',
  //   justifyContent: 'center',
  // }
  // sxFix.bgcolor = theme.palette.infoBox.main

  let sxFull = { ...theme.palette.infoBox, ...props.sx }
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
    borderColor: 'red',
    borderRadius: '4px',
    fontFamily: 'inherit', // Ensure that it inherits the font
    fontSize: 'inherit',
  }
  return (
    <Tooltip title={title} placement={placement} arrow style={ToolTipStyle}>
      {children}
    </Tooltip>
  )
}

//DEMO
function SLDRDetalle(props) {
  const { title, text } = props
  return (
    <Box>
      <CollapsibleCard
        title={title}
        titleVariant="body"
        titleSX={{ color: 'blue', mb: '-1rem' }}
        descriptionVariant="body"
        descriptionSX={{ fontSize: '15px', color: 'green', fontStyle: 'italic' }}
        description={text}
      ></CollapsibleCard>
    </Box>
  )
}

function SLDRInputField({ unit, object, MUIType, toolTipPlacement, ...props }) {
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
          title={<Typography>{t(`${object}.TOOLTIP.${props.name}`)}</Typography>}
          placement={toolTipPlacement ?? 'top'}
        >
          <TextField {...field} {...sxFull} />
        </SLDRTooltip>
      )}
      {MUIType === 'TextareaAutosize' && (
        <SLDRTooltip
          title={<Typography>{t(`${object}.TOOLTIP.${props.name}`)}</Typography>}
          placement="top"
        >
          <TextareaAutosize {...field} {...sxFull} />
        </SLDRTooltip>
      )}

      {MUIType === 'Checkbox' && (
        <SLDRTooltip
          title={<Typography>{t(`${object}.TOOLTIP.${props.name}`)}</Typography>}
          placement="top"
        >
          <Checkbox {...field} {...sxFull} />
        </SLDRTooltip>
      )}
      {meta.error ? (
        <ErrorMessage name={props.name}>
          {(msg) => <div style={{ color: 'red' }}>{msg}</div>}
        </ErrorMessage>
      ) : null}

      {/* {meta.error ? <div style={{ color: 'red' }}>{meta.error}</div> : null} */}
    </>
  )
}

export { SLDRFooterBox, SLDRInfoBox, SLDRInputField, SLDRTooltip, SLDRDetalle }
