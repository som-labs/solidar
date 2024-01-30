import { useRef } from 'react'
import { useReactToPrint } from 'react-to-print'
import { PDF } from './PDF'
import { Button } from '@mui/material'
import { useTranslation } from 'react-i18next'

const Report = ({ data }) => {
  const componentRef = useRef()

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  })

  const { t } = useTranslation()

  return (
    <div style={{ width: 1145, margin: '0 auto' }}>
      <div style={{ backgroundColor: 'white', padding: 15, marginBottom: 20 }}>
        <Button onClick={handlePrint} style={{ backgroundColor: '#b9db42' }}>
          {t('IMPRIMIR')}
        </Button>
      </div>
      <PDF data={data} ref={componentRef} />
    </div>
  )
}

export default Report
