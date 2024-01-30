import React from 'react'
import { useTranslation } from 'react-i18next'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  LabelList,
} from 'recharts'

const ReportConsumGraph = ({ autoconsum, consum, excedencia }) => {
  const { t } = useTranslation()

  const months = [
    'JAN',
    'FEB',
    'MAR',
    'APR',
    'MAY',
    'JUNE',
    'JULY',
    'AUG',
    'SEPT',
    'OCT',
    'NOV',
    'DEC',
  ]

  const data = months.map((month, k) => ({
    month: t(month),
    ac: autoconsum[k],
    c: consum[k],
    ex: excedencia[k],
  }))

  const formatter = (value) => `${Math.round(value)}€`

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        width={500}
        height={300}
        data={data}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis tickFormatter={formatter} />
        <Legend verticalAlign="bottom" align="right" height={36} />
        <Bar dataKey="ac" stackId="a" fill="#b9db42" name={t('AUTOCONSUM_DIRECTE')}>
          <LabelList dataKey="ac" position="inside" formatter={formatter} />
        </Bar>

        <Bar dataKey="c" stackId="a" fill="#beaf17" name={t('CONSUM')}>
          <LabelList dataKey="c" position="inside" formatter={formatter} />
        </Bar>

        <Bar dataKey="ex" stackId="a" fill="#d72929" name={t('ENERGIA_EXCEDENTARIA')}>
          <LabelList dataKey="ex" position="inside" formatter={formatter} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export default ReportConsumGraph
