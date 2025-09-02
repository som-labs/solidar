import React from 'react'
import { useState, useEffect } from 'react'
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

  return (
    <>
      <ScrollToTop />
      <Box
        sx={{
          width: '102.5%',
          display: 'flex',
          flexFlow: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          mt: -1,
          mb: 2,
          ml: -1.75,
          flexShrink: 0,
        }}
      >
        <Button
          disabled={prevDisabled || !isCurrent}
          startIcon={<ArrowBackIosIcon />}
          onClick={prev}
        >
          {prevLabel}
        </Button>
        {title ? <Typography sx={theme.titles.level_0}>{title}</Typography> : null}
        <Button
          endIcon={<ArrowForwardIosIcon />}
          disabled={nextDisabled || !isCurrent}
          onClick={next}
        >
          {nextLabel}
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
        sx={{
          width: '100%',
          display: 'flex',
          flexFlow: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          my: 2,
          backgroundColor: theme.palette.secondary.main,
          color: theme.palette.secondary.contrastText,
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
  const theme = useTheme()

  const {
    children,
    showAll = false,
    variant = 'progress',
    onPageChange,
    nextLabel,
    prevLabel,
  } = params

  const [currentStep, setCurrentStep] = useState(0)
  const [isInTransition, beInTransition] = useState(false)
  const totalSteps = children.length

  useEffect(() => {
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
            backgroundColor: theme.palette.secondary.main,
            color: theme.palette.secondary.contrastText,
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
