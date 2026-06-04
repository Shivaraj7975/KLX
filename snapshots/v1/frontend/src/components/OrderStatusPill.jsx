const statusClass = (status) => {
  if (!status) return 'status-pill'
  const normalized = status.toUpperCase()
  if (normalized.includes('DELIVERED')) return 'status-pill success'
  if (normalized.includes('FAILED') || normalized.includes('REJECT') || normalized.includes('CANCEL')) {
    return 'status-pill danger'
  }
  if (
    normalized.includes('PENDING') ||
    normalized.includes('ASSIGN') ||
    normalized.includes('OUT_FOR_DELIVERY') ||
    normalized.includes('OUT FOR DELIVERY') ||
    normalized.includes('IN_TRANSIT') ||
    normalized.includes('ON_THE_WAY')
  ) {
    return 'status-pill warning'
  }
  return 'status-pill'
}

const OrderStatusPill = ({ status }) => (
  <span className={statusClass(status)}>{status.replaceAll('_', ' ')}</span>
)

export default OrderStatusPill
