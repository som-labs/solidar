const cleanPercentage = (percentage) => {
  const isNegativeOrNaN = !Number.isFinite(+percentage) || percentage < 0
  const isTooHigh = percentage > 100
  return isNegativeOrNaN ? 0 : isTooHigh ? 100 : +percentage
}

const Circle = ({ color, percentage, label, description }) => {
  const r = 70
  const circ = 2 * Math.PI * r
  const strokePct = ((100 - percentage) * circ) / 100
  return (
    <circle
      r={r}
      cx={100}
      cy={100}
      fill="transparent"
      stroke={strokePct !== circ ? color : ''}
      strokeWidth={'1rem'}
      strokeDasharray={circ}
      strokeDashoffset={percentage ? strokePct : 0}
    />
  )
}

const Text = ({ percentage }) => {
  return (
    <text
      x="50%"
      y="50%"
      dominantBaseline="central"
      textAnchor="middle"
      fontSize={'2em'}
      fontWeight="bold"
    >
      {percentage.toFixed(0)}%
    </text>
  )
}

const PieChart = ({ percentage, color, label, description }) => {
  const pct = cleanPercentage(percentage)
  return (
    <div style={{ textAlign: 'center' }}>
      <h3>{label}</h3>
      <p style={{ fontSize: 11, fontStyle: 'italic', margin: 0 }}>
        <small>{description}</small>
      </p>
      <svg width={200} height={200}>
        <g transform={`rotate(-90 ${'100 100'})`}>
          <Circle color="lightgrey" />
          <Circle color={color} percentage={pct} />
        </g>
        <Text percentage={pct} />
      </svg>
    </div>
  )
}

export default PieChart
