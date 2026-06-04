const QuantityStepper = ({ value, onChange }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
    <button className="button ghost quantity" onClick={() => onChange(value - 1)}>
      -
    </button>
    <strong>{value}</strong>
    <button className="button ghost quantity" onClick={() => onChange(value + 1)}>
      +
    </button>
  </div>
)

export default QuantityStepper
