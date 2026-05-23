import { useState, useContext } from 'react'
import { useTranslation } from 'react-i18next'

import {
  Box,
  TextField,
  InputAdornment,
  TextareaAutosize,
  Checkbox,
  Typography,
  Tooltip,
  IconButton,
  Card,
  CardHeader,
  CardContent,
  Collapse,
  Select,
} from '@mui/material'
import { styled } from '@mui/material/styles'
import { useTheme } from '@mui/material/styles'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

//Formik
import { ErrorMessage, useField, FormikContext } from 'formik'

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
  let sxFull = { ...theme.palette.infoBox, ...props.sx }
  return (
    <>
      <Box sx={sxFull}>{props.children}</Box>
    </>
  )
}

//REVISAR: estos style no estan funcionando
function SLDRTooltip({ title, children, placement }) {
  return (
    <Tooltip title={title} placement={placement} arrow>
      {children}
    </Tooltip>
  )
}

function SLDRDetalle(props) {
  const { title, text } = props
  return (
    <Box>
      <SLDRCollapsibleCard
        title={title}
        titleVariant="body"
        titleSX={{ color: 'blue', mb: '-1rem' }}
        descriptionVariant="body"
        descriptionSX={{ fontSize: '15px', color: 'green', fontStyle: 'italic' }}
      >
        <Typography
          variant="body"
          dangerouslySetInnerHTML={{
            __html: text,
          }}
        />
      </SLDRCollapsibleCard>
    </Box>
  )
}

// function SLDRInputField({ unit, object, MUIType, toolTipPlacement, ...props }) {
//   const [field, meta] = useField(props)
//   const { t } = useTranslation()

//   const defaultStyle = {
//     textAlign: 'right',
//     padding: '8px',
//     //borderColor: 'green',
//     //borderRadius: '10px',
//   }

//   const sxFix = {
//     // border: '1px solid',
//     flex: 1,
//     borderRadius: '20px',
//     //borderColor: 'green',
//     fontFamily: 'inherit', // Ensure that it inherits the font
//     fontSize: 'inherit',
//   }

//   const finalStyle = { ...defaultStyle, ...props.sx }

//   const textFieldProps = {
//     variant: 'outlined',
//     size: 'small',
//   }

//   if (props.onChange) {
//     if (MUIType === 'Number') {
//       console.log(props)
//     }
//     textFieldProps.onChange = props.onChange
//   }

//   if (MUIType !== 'Checkbox' && MUIType !== 'TextareaAutosize' && MUIType !== 'Select')
//     textFieldProps.InputProps = {
//       endAdornment: <InputAdornment position="start">{unit}</InputAdornment>,
//       inputProps: {
//         style: finalStyle,
//       },
//     }

//   let sxFull = { ...sxFix, ...props.sx }

//   // console.log('props', props)
//   // console.log('MUIType', MUIType)
//   // console.log('sxfull', sxFull)
//   // console.log('textFieldProps', textFieldProps)
//   // console.dir(field)

//   return (
//     <>
//       {(MUIType === undefined || MUIType === 'text') && (
//         <>
//           {object !== undefined ? (
//             <SLDRTooltip
//               title={
//                 <Typography
//                   dangerouslySetInnerHTML={{
//                     __html: t(`${object}.TOOLTIP.${props.name}`),
//                   }}
//                 />
//               }
//               placement={toolTipPlacement ?? 'top'}
//             >
//               <TextField
//                 {...textFieldProps}
//                 {...field}
//                 {...props} // ← props del usuario GANAN
//                 sx={sxFull}
//                 error={meta.touched && Boolean(meta.error)}
//               />
//             </SLDRTooltip>
//           ) : (
//             <TextField {...field} {...textFieldProps} {...props} sx={sxFull} />
//           )}
//         </>
//       )}

//       {MUIType === 'Select' && (
//         <SLDRTooltip
//           title={
//             <Typography
//               dangerouslySetInnerHTML={{
//                 __html: t(`${object}.TOOLTIP.${props.name}`),
//               }}
//             />
//           }
//           placement="right"
//         >
//           <Select {...field} {...textFieldProps} sx={sxFull} value={props.value}>
//             {props.children}
//           </Select>
//         </SLDRTooltip>
//       )}

//       {MUIType === 'TextareaAutosize' && (
//         <SLDRTooltip
//           title={
//             <Typography
//               dangerouslySetInnerHTML={{
//                 __html: t(`${object}.TOOLTIP.${props.name}`),
//               }}
//             />
//           }
//           placement="top"
//         >
//           <TextareaAutosize
//             {...field}
//             {...textFieldProps}
//             sx={sxFull}
//             error={meta.touched && Boolean(meta.error)}
//           />
//         </SLDRTooltip>
//       )}

//       {MUIType === 'Checkbox' && (
//         <SLDRTooltip
//           title={
//             <Typography
//               dangerouslySetInnerHTML={{
//                 __html: t(`${object}.TOOLTIP.${props.name}`),
//               }}
//             />
//           }
//           placement="top"
//         >
//           <Checkbox
//             {...field}
//             {...textFieldProps}
//             sx={sxFull}
//             error={meta.touched && Boolean(meta.error)}
//           />
//         </SLDRTooltip>
//       )}
//       {meta.error ? (
//         <ErrorMessage name={props.name}>
//           {(msg) => <div style={{ color: 'red' }}>{msg}</div>}
//         </ErrorMessage>
//       ) : null}
//     </>
//   )
// }

function SLDRCollapsibleCard(props) {
  const theme = useTheme()
  const [expanded, setExpanded] = useState(props.expanded)

  const handleExpandClick = () => {
    setExpanded(!expanded)
  }

  const defaultStyle = {
    color: theme.palette.primary.main,
    borderTop: 2,
    textAlign: 'center',
    padding: '8px',
    fontFamily: 'inherit',
    fontSize: 'inherit',
  }

  const titleStyle = { ...defaultStyle, ...props.titleSX }

  return (
    <Card>
      <CardHeader
        title={props.title}
        sx={theme.titles.collapsible}
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
        <CardContent sx={theme.palette.infoBox}>{props.children}</CardContent>
      </Collapse>
    </Card>
  )
}

// ─── Componente base (no sabe nada de Formik) ────────────────────────────────
function SLDRInputFieldBase({
  unit,
  object,
  MUIType,
  toolTipPlacement,
  field,
  meta,
  ...props
}) {
  const { t } = useTranslation()

  const defaultStyle = {
    textAlign: 'right',
    padding: '8px',
  }

  const sxFix = {
    flex: 1,
    borderRadius: '20px',
    fontFamily: 'inherit',
    fontSize: 'inherit',
  }

  const finalStyle = { ...defaultStyle, ...props.sx }

  const textFieldProps = {
    variant: 'outlined',
    size: 'small',
  }

  if (props.onChange) {
    textFieldProps.onChange = props.onChange
  }

  if (MUIType !== 'Checkbox' && MUIType !== 'TextareaAutosize' && MUIType !== 'Select') {
    textFieldProps.InputProps = {
      endAdornment: <InputAdornment position="start">{unit}</InputAdornment>,
      inputProps: {
        style: finalStyle,
      },
    }
  }

  const sxFull = { ...sxFix, ...props.sx }
  const hasError = props.error ?? (meta.touched && Boolean(meta.error))

  const tooltip = object ? (
    <Typography
      dangerouslySetInnerHTML={{
        __html: t(`${object}.TOOLTIP.${props.name}`),
      }}
    />
  ) : null

  return (
    <>
      {(MUIType === undefined || MUIType === 'text') && (
        <>
          {tooltip ? (
            <SLDRTooltip title={tooltip} placement={toolTipPlacement ?? 'top'}>
              <TextField
                {...textFieldProps}
                {...field}
                {...props}
                sx={sxFull}
                error={hasError}
              />
            </SLDRTooltip>
          ) : (
            <TextField {...field} {...textFieldProps} {...props} sx={sxFull} />
          )}
        </>
      )}

      {MUIType === 'Select' && (
        <SLDRTooltip title={tooltip} placement="right">
          <Select {...field} {...textFieldProps} sx={sxFull} value={props.value}>
            {props.children}
          </Select>
        </SLDRTooltip>
      )}

      {MUIType === 'TextareaAutosize' && (
        <SLDRTooltip title={tooltip} placement="top">
          <TextareaAutosize {...field} {...textFieldProps} sx={sxFull} error={hasError} />
        </SLDRTooltip>
      )}

      {MUIType === 'Checkbox' && (
        <SLDRTooltip title={tooltip} placement="top">
          <Checkbox {...field} {...textFieldProps} sx={sxFull} error={hasError} />
        </SLDRTooltip>
      )}

      {meta.error ? (
        <ErrorMessage name={props.name}>
          {(msg) => <div style={{ color: 'red' }}>{msg}</div>}
        </ErrorMessage>
      ) : null}
    </>
  )
}

// ─── Wrapper interno para uso dentro de Formik ────────────────────────────────
function SLDRInputFieldFormik({ unit, object, MUIType, toolTipPlacement, ...props }) {
  const [field, meta] = useField(props)
  return (
    <SLDRInputFieldBase
      unit={unit}
      object={object}
      MUIType={MUIType}
      toolTipPlacement={toolTipPlacement}
      field={field}
      meta={meta}
      {...props}
    />
  )
}

// ─── Componente público: detecta automáticamente el contexto ──────────────────
export default function SLDRInputField({
  unit,
  object,
  MUIType,
  toolTipPlacement,
  ...props
}) {
  const formik = useContext(FormikContext)

  if (formik) {
    return (
      <SLDRInputFieldFormik
        unit={unit}
        object={object}
        MUIType={MUIType}
        toolTipPlacement={toolTipPlacement}
        {...props}
      />
    )
  }

  // Fuera de Formik: construimos field y meta manualmente
  const field = {
    name: props.name,
    value: props.value ?? '',
    onChange: props.onChange ?? (() => {}),
    onBlur: props.onBlur ?? (() => {}),
  }
  const meta = { touched: false, error: null }

  return (
    <SLDRInputFieldBase
      unit={unit}
      object={object}
      MUIType={MUIType}
      toolTipPlacement={toolTipPlacement}
      field={field}
      meta={meta}
      {...props}
    />
  )
}

export {
  SLDRFooterBox,
  SLDRInfoBox,
  SLDRInputField,
  SLDRTooltip,
  SLDRDetalle,
  SLDRCollapsibleCard,
}
