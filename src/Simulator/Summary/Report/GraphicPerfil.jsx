import React from 'react'
import { useTranslation } from 'react-i18next'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from 'recharts'

const GraphicPerfil = ({ profile, autoproduction }) => {
  const { t } = useTranslation()

  const data = profile.map((value, k) => ({
    name: `${k}h`,
    profile: value,
    autoproduction: autoproduction[k],
  }))

  const formatter = (value) => `${value} kWh`
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={data}
        margin={{
          top: 10,
          right: 30,
          left: 0,
          bottom: 0,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis type="number" tickFormatter={formatter} />

        <Area
          type="monotone"
          dataKey="profile"
          stroke="#4671ad"
          strokeWidth={3}
          fill="#a1bee5"
          name={t('PERFIL_DIARI')}
        />
        <Area
          type="monotone"
          dataKey="autoproduction"
          stroke="#ff9700"
          strokeWidth={3}
          fill="#ffc100"
          label={'Autoproduccio'}
          name={t('PERFIL_AUTOPRODUCCIO')}
        />

        <Legend verticalAlign="bottom" align="right" height={36} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export default GraphicPerfil
