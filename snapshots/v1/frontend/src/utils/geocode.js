const formatAddress = (address) => {
  if (!address) return ''
  const city = address.city || address.town || address.village || address.municipality || address.county
  const line1 = [address.house_number, address.road].filter(Boolean).join(' ')
  const line2 = [address.neighbourhood, address.suburb, address.locality].filter(Boolean).join(', ')
  const line3 = [city, address.state, address.postcode, address.country].filter(Boolean).join(', ')
  return [line1, line2, line3].filter(Boolean).join(', ')
}

export const reverseGeocode = async (lat, lon) => {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&addressdetails=1&zoom=18`,
    {
      headers: { 'Accept-Language': 'en' },
    }
  )
  if (!response.ok) {
    throw new Error('Failed to reverse geocode')
  }
  const data = await response.json()
  return formatAddress(data.address) || data.display_name || `${lat}, ${lon}`
}
