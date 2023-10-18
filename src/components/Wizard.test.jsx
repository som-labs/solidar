import { beforeEach, afterEach, describe, expect, test, it, fn } from 'vitest'
import { cleanup, render, screen, fireEvent, act, waitFor } from '@testing-library/react'
import Wizard from './Wizard'
import React from 'react'

function nextButton() {
  return screen.queryByText('Next')
}
function prevButton() {
  return screen.queryByText('Previous')
}
function pagesStatus() {
  return ['page 1', 'page 2', 'page 3'].map((p) => screen.queryByText(p) !== null)
}

afterEach(() => {
  cleanup()
})

describe('Simple paging', () => {
  beforeEach(() => {
    render(
      <Wizard>
        <p key={1}>page 1</p>
        <p key={2}>page 2</p>
        <p key={3}>page 3</p>
      </Wizard>,
    )
    //screen.debug()
  })
  it('Start at first page', () => {
    expect(pagesStatus()).toEqual([true, false, false])
    expect(prevButton().disabled).toBe(true)
    expect(nextButton().disabled).toBe(false)
  })
  it('Next page', () => {
    fireEvent.click(nextButton())
    expect(pagesStatus()).toEqual([false, true, false])
    expect(prevButton().disabled).toBe(false)
    expect(nextButton().disabled).toBe(false)
  })
  it('Last page', () => {
    fireEvent.click(nextButton())
    fireEvent.click(nextButton())
    expect(pagesStatus()).toEqual([false, false, true])
    expect(prevButton().disabled).toBe(false)
    expect(nextButton().disabled).toBe(true)
  })
  it('Backwards', () => {
    fireEvent.click(nextButton())
    fireEvent.click(nextButton())
    fireEvent.click(prevButton())
    expect(pagesStatus()).toEqual([false, true, false])
    expect(prevButton().disabled).toBe(false)
    expect(nextButton().disabled).toBe(false)
  })
})

describe('Skip attribute', () => {
  function wizardWithSkip(pageSkip) {
    render(
      <Wizard>
        <p key={1}>page 1</p>
        <p key={2} skip={pageSkip}>
          page 2
        </p>
        <p key={3}>page 3</p>
      </Wizard>,
    )
  }
  it('When skip is a function returning true, page is skipped', () => {
    wizardWithSkip(() => true)
    fireEvent.click(nextButton())
    expect(pagesStatus()).toEqual([false, false, true])
  })
  it('When skip is a function returning false, page is not skipped', () => {
    wizardWithSkip(() => false)
    fireEvent.click(nextButton())
    expect(pagesStatus()).toEqual([false, true, false])
  })
  it('When skip is a true value, skip', () => {
    wizardWithSkip(true)
    fireEvent.click(nextButton())
    expect(pagesStatus()).toEqual([false, false, true])
  })
  it('When skip is a false value, do not skip', () => {
    wizardWithSkip(false)
    fireEvent.click(nextButton())
    expect(pagesStatus()).toEqual([false, true, false])
  })
  it('Skipped also backwards', () => {
    wizardWithSkip(true)
    fireEvent.click(nextButton())
    fireEvent.click(prevButton())
    expect(pagesStatus()).toEqual([true, false, false])
  })
})

describe('onPageChange callback', () => {
  let calls = []
  function record(...values) {
    calls.push(values)
  }
  beforeEach(() => {
    calls = []
    render(
      <Wizard onPageChange={record}>
        <p key={1}>page 1</p>
        <p key={2}>page 2</p>
        <p key={3}>page 3</p>
      </Wizard>,
    )
  })
  it('Start at first page', () => {
    expect(calls).toEqual([[0]])
  })
  it('Next page', () => {
    fireEvent.click(nextButton())
    expect(calls).toEqual([[0], [1]])
  })
  it('Last page', () => {
    fireEvent.click(nextButton())
    fireEvent.click(nextButton())
    expect(calls).toEqual([[0], [1], [2]])
  })
  it('Backwards', () => {
    fireEvent.click(nextButton())
    fireEvent.click(nextButton())
    fireEvent.click(prevButton())
    expect(calls).toEqual([[0], [1], [2], [1]])
  })
})

describe('Page validation', () => {
  function wizardWithValidation(validate) {
    render(
      <Wizard>
        <p key={1} validate={validate}>
          page 1
        </p>
        <p key={2}>page 2</p>
      </Wizard>,
    )
  }
  it('callback returns true, disables next', () => {
    wizardWithValidation(() => true)
    expect(nextButton().disabled).toBe(true)
  })
  it('callback returns false, does not disable next', () => {
    wizardWithValidation(() => false)
    expect(nextButton().disabled).toBe(false)
  })
  it('callback returns string, disable next and shows error', () => {
    wizardWithValidation(() => 'An error has occurred')
    expect(nextButton().disabled).toBe(true)
    expect(screen.queryByText('An error has occurred')).toBeTruthy()
  })
})

describe('Next attribute', () => {
  function wizardWithNext(next) {
    render(
      <Wizard>
        <p key={1} id="page1" next={next}>
          page 1
        </p>
        <p key={2}>page 2</p>
        <p key={3}>page 3</p>
      </Wizard>,
    )
  }
  it('value false, keeps page', () => {
    wizardWithNext(false)
    fireEvent.click(nextButton())
    expect(pagesStatus()).toEqual([true, false, false])
  })
  it('value true, advances page', () => {
    wizardWithNext(true)
    fireEvent.click(nextButton())
    expect(pagesStatus()).toEqual([false, true, false])
  })
  it('value undefined (next attribute not present), advances page', () => {
    wizardWithNext(undefined)
    fireEvent.click(nextButton())
    expect(pagesStatus()).toEqual([false, true, false])
  })
  it('callback returns false, keeps page', () => {
    wizardWithNext(() => false)
    fireEvent.click(nextButton())
    expect(pagesStatus()).toEqual([true, false, false])
  })
  it('callback returns true, keeps page', () => {
    wizardWithNext(() => true)
    fireEvent.click(nextButton())
    expect(pagesStatus()).toEqual([false, true, false])
  })
  it('promise resolving false, keeps page', async () => {
    var resolveFunction = undefined
    const promise = new Promise((resolve, reject) => {
      resolveFunction = resolve
    })
    wizardWithNext(() => promise)
    fireEvent.click(nextButton())
    await waitFor(() => expect(nextButton().disabled).toBe(true))
    resolveFunction(false)
    await waitFor(() => expect(nextButton().disabled).toBe(false))
    await waitFor(() => expect(pagesStatus()).toEqual([true, false, false]))
  })
  it('promise resolving true, advances page', async () => {
    var resolveFunction = undefined
    const promise = new Promise((resolve, reject) => {
      resolveFunction = resolve
    })
    wizardWithNext(() => promise)
    fireEvent.click(nextButton())
    expect(nextButton().disabled).toBe(true)
    resolveFunction(true)

    await waitFor(() => expect(nextButton().disabled).toBe(false))
    await waitFor(() => expect(pagesStatus()).toEqual([false, true, false]))
  })
  /*
  it('callback returns string, disable next and shows error', () => {
    wizardWithNext(() => 'An error has occurred')
    expect(nextButton().disabled).toBe(true)
    expect(screen.queryByText('An error has occurred')).toBeTruthy()
  })
  */
})
// - next=true and next skipif evaluates to true, skips
// - next=true and next skipif evaluates to false, do not skip
// - next=true, but none left, stays
// - next=explicitPage
// - next=notExistingPage
// - on start, skipif is considered to jump 0 or later

//describe('Custom buttons', () => {})
//describe('Hide buttons', () => {})
