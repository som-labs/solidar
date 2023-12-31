import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import LinearProgress from '@mui/material/LinearProgress'
import Stepper from '@mui/material/Stepper'
import Step from '@mui/material/Step'
import StepLabel from '@mui/material/StepLabel'
import Typography from '@mui/material/Typography'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos'
import SendIcon from '@mui/icons-material/Send'
import React from 'react'

function DefaultWizardPage(params) {
  const {
    children,
    showAll,
    ichild,
    isCurrent,
    next,
    prev,
    prevDisabled = false,
    nextDisabled = false,
    nextLabel = 'Next',
    prevLabel = 'Previous',
    validationErrors,
  } = params
  console.log(children)

  return (
    <Box
      key={ichild}
      sx={
        showAll && isCurrent
          ? {
              borderLeft: '6pt solid',
              borderColor: 'palette.primary',
              paddingLeft: '2pt',
            }
          : {}
      }
    >
      {children}
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          flexFlow: 'row',
          justifyContent: 'space-between',
          my: 2,
        }}
      >
        <Button
          disabled={prevDisabled || !isCurrent}
          startIcon={<ArrowBackIosIcon />}
          onClick={prev}
        >
          {prevLabel}
        </Button>
        {validationErrors ? (
          <Typography variant="body1" color="error">
            {validationErrors}
          </Typography>
        ) : null}
        <Button
          variant="contained"
          endIcon={<ArrowForwardIosIcon />}
          disabled={nextDisabled || !isCurrent}
          onClick={next}
        >
          {nextLabel}
        </Button>
      </Box>
    </Box>
  )
}

function callOrValue(f, ...params) {
  if (typeof f === 'function') return f(...params)
  return f
}

export default function Wizard(params) {
  const { children, showAll = false, variant = 'progress', onPageChange } = params
  const [currentStep, setCurrentStep] = React.useState(0)
  const totalSteps = children.length

  React.useEffect(() => {
    onPageChange && onPageChange(currentStep)
  }, [currentStep])

  function next() {
    setCurrentStep((current) => {
      var inext = current + 1
      while (callOrValue(children[inext].props.skip)) inext++
      if (inext >= totalSteps) return current
      return inext
    })
  }

  function prev() {
    setCurrentStep((current) => {
      var inext = current - 1
      while (callOrValue(children[inext]?.props?.skip)) inext--
      if (inext < 0) return current
      return inext
    })
  }

  return (
    <Box>
      {variant === 'tabs' ? (
        <Box
          sx={{
            display: 'flex',
            width: '100%',
            flexFlow: 'row',
            justifyContent: 'space-around',
          }}
        >
          {children.map((child, ichild) => (
            <Typography
              variant="button"
              disabled={ichild > currentStep}
              key={ichild}
              sx={{
                ...(ichild === currentStep ? { fontWeight: 'bold' } : { opacity: '50%' }),
                my: 1.3,
              }}
            >
              {child.props.title}
            </Typography>
          ))}
        </Box>
      ) : null}
      {variant === 'progress' || variant === 'tabs' ? (
        <LinearProgress
          variant="determinate"
          value={(100 * (currentStep + 1)) / totalSteps}
        />
      ) : null}
      {variant === 'stepper' ? (
        <Stepper activeStep={currentStep} alternativeLabel>
          {children.map((child, ichild) => (
            <Step key={ichild}>
              <StepLabel>{child.props.title}</StepLabel>
            </Step>
          ))}
        </Stepper>
      ) : null}
      {children.map((child, ichild) => {
        const isCurrent = ichild === currentStep
        const prevDisabled = ichild === 0
        const validationErrors = callOrValue(child.props?.validate)
        const nextDisabled = ichild === totalSteps - 1 || validationErrors
        if (!showAll && !isCurrent) return null
        return (
          <fieldset key={ichild} style={{ border: 'none' }} disabled={!isCurrent}>
            <DefaultWizardPage
              {...{
                validationErrors,
                ichild,
                showAll,
                isCurrent,
                next,
                prev,
                nextDisabled,
                prevDisabled,
              }}
            >
              {child}
            </DefaultWizardPage>
          </fieldset>
        )
      })}
    </Box>
  )
}

//// Example

const WizardExampleContext = React.createContext({ value: '', setValue: () => {} })

function MyPage({ label }) {
  const { value, setValue } = React.useContext(WizardExampleContext)
  const field = label.toLowerCase()
  console.log('Value in Mypage', value)
  return (
    <Container>
      <TextField
        label={label}
        value={value[field] ? value[field] : ''}
        onChange={(e) => {
          setValue((old) => {
            console.log('Prechange', e, old)
            const newValue = { ...old }
            newValue[field] = e.target.value
            console.log('changed:', newValue)
            return newValue
          })
        }}
      ></TextField>
    </Container>
  )
}

export function WizardExample() {
  const [variant, setVariant] = React.useState('progress')
  const [value, setValue] = React.useState({
    primera: '',
    segunda: '',
    tercera: '',
    quarta: '',
  })
  return (
    <>
      <WizardExampleContext.Provider value={{ value, setValue }}>
        <Wizard variant={variant}>
          <MyPage
            title="La primera"
            label="Primera"
            validate={() => {
              if (!value?.primera) return true
              if (value?.primera !== '1') return 'Tiene que ser 1'
            }}
          />
          <MyPage title="La segunda" label="Segunda" skip={() => true} />
          <MyPage title="La tercera" label="Tercera" skip={() => false} />
          <MyPage title="La cuarta" label="Cuarta" skip={() => false} />
        </Wizard>
      </WizardExampleContext.Provider>

      <Select value={variant} onChange={(e) => setVariant(e.target.value)}>
        <MenuItem value={'progress'}>Progress Bar</MenuItem>
        <MenuItem value={'tabs'}>Tabs</MenuItem>
        <MenuItem value={'stepper'}>Stepper</MenuItem>
      </Select>

      <Container>
        <pre>{JSON.stringify(value, null, 2)}</pre>
      </Container>

      <Wizard>
        <p>page 1</p>
        <p>page 2</p>
        <p>page 3</p>
      </Wizard>
    </>
  )
}
