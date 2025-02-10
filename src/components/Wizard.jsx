import { useState, useEffect, useRef } from 'react'
import { createBrowserRouter, RouterProvider, useLocation } from 'react-router-dom'

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
import { useTheme } from '@mui/material/styles'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function DefaultWizardPage(params) {
  const {
    children,
    showAll,
    ichild,
    isCurrent,
    title,
    next,
    prev,
    prevDisabled = false,
    nextDisabled = false,
    nextLabel, // = 'Next',
    prevLabel, // = 'Previous',
    validationErrors,
  } = params

  const theme = useTheme()
  // const [pieVisible, setPieVisible] = useState(false)
  // const targetRef = useRef(null)

  // useEffect(() => {
  //   const observer = new IntersectionObserver(
  //     ([entry]) => {
  //       setPieVisible(entry.isIntersecting)
  //     },
  //     { threshold: 0 },
  //   )
  //   if (targetRef.current) {
  //     observer.observe(targetRef.current)
  //   }

  //   return () => observer.disconnect()
  // }, [])

  return (
    <>
      <ScrollToTop />
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          flexFlow: 'row',
          justifyContent: 'center',
          my: 2,
        }}
      >
        {/* Los botones superiores se mantienen fijos y visibles hasta que aparecen los botones inferiores */}
        <Button
          sx={{
            position: 'fixed',
            // visibility: pieVisible || prevDisabled ? 'hidden' : 'visible',
            visibility: prevDisabled ? 'hidden' : 'visible',
            left: 0, // Distance from right
            zIndex: 1000, // Ensures it stays on top
            borderRadius: 3, // Makes it round
            //bottom: 20, // Distance from bottom
            //width: 120,
            //height: 50,
            //padding: 1,
            //minWidth: 'auto',
            //display: prevDisabled ? 'none' : 'block',
            //width: 'fit-content',
          }}
          variant="contained"
          startIcon={<ArrowBackIosIcon />}
          onClick={prev}
        >
          {/* {prevLabel} */}
        </Button>
        {title ? <Typography sx={theme.titles.level_0}>{title}</Typography> : null}

        <Button
          sx={{
            position: 'fixed',
            // visibility: pieVisible || nextDisabled ? 'hidden' : 'visible',
            visibility: nextDisabled ? 'hidden' : 'visible',
            right: 0, // Distance from right
            zIndex: 1000, // Ensures it stays on top
            borderRadius: 3, // Makes it round
            //bottom: 20, // Distance from bottom
            //width: 10,
            //height: 50,
            //padding: 1,
            //minWidth: 'auto',
            //width: 'fit-content',
          }}
          variant="contained"
          endIcon={<ArrowForwardIosIcon />}
          onClick={next}
        >
          {/* {nextLabel} */}
        </Button>
      </Box>
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
      </Box>
      <Box
        // ref={targetRef}
        sx={{
          width: '100%',
          display: 'flex',
          flexFlow: 'row',
          justifyContent: 'space-between',
          my: 2,
        }}
      >
        <Button
          sx={{
            visibility: prevDisabled ? 'hidden' : 'visible',
          }}
          variant="contained"
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
          sx={{
            visibility: nextDisabled ? 'hidden' : 'visible',
          }}
          variant="contained"
          endIcon={<ArrowForwardIosIcon />}
          disabled={nextDisabled || !isCurrent}
          onClick={next}
        >
          {nextLabel}
        </Button>
      </Box>
    </>
  )
}

function callOrValue(f, ...params) {
  if (typeof f === 'function') return f(...params)
  return f
}
function isPromise(thing) {
  return typeof thing?.then === 'function'
}

export default function Wizard(params) {
  const {
    children,
    showAll = false,
    variant = 'progress',
    onPageChange,
    nextLabel,
    prevLabel,
  } = params
  const [currentStep, setCurrentStep] = React.useState(0)
  const [isInTransition, beInTransition] = React.useState(false)
  const totalSteps = children.length

  React.useEffect(() => {
    onPageChange && onPageChange(currentStep)
  }, [currentStep])

  function skipNext(inext) {
    while (callOrValue(children[inext].props.skip)) inext++
    if (inext >= totalSteps) return undefined
    return inext
  }

  function skipPrev(iprev) {
    while (callOrValue(children[iprev]?.props?.skip)) iprev--
    if (iprev < 0) return undefined
    return iprev
  }

  async function next() {
    var nextAttribute = callOrValue(children[currentStep].props.next)
    if (isPromise(nextAttribute)) {
      beInTransition(true)
      nextAttribute = await nextAttribute
      beInTransition(false)
    }
    var inext = nextAttribute === false ? currentStep : currentStep + 1
    const skippedNext = skipNext(inext) ?? currentStep
    setCurrentStep(skippedNext)
  }

  function prev() {
    setCurrentStep((current) => {
      var inext = current - 1
      return skipPrev(inext) ?? current
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
        const prevDisabled = ichild === 0 || isInTransition
        const validationErrors = callOrValue(child.props?.validate)
        const title = child.props.title
        const nextDisabled =
          ichild === totalSteps - 1 || !!validationErrors || isInTransition
        if (!showAll && !isCurrent) return null

        return (
          <fieldset key={ichild} style={{ border: 'none' }} disabled={!isCurrent}>
            <DefaultWizardPage
              {...{
                validationErrors,
                ichild,
                showAll,
                isCurrent,
                title,
                next,
                prev,
                nextLabel,
                prevLabel,
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
  return (
    <Container>
      <TextField
        label={label}
        value={value[field] ? value[field] : ''}
        onChange={(e) => {
          setValue((old) => {
            const newValue = { ...old }
            newValue[field] = e.target.value
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
