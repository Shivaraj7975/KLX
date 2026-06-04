import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet'
import { useEffect, useMemo } from 'react'
import L from 'leaflet'

const MapUpdater = ({ center, zoom }) => {
  const map = useMap()

  useEffect(() => {
    map.setView(center, zoom, { animate: true })
  }, [center, map, zoom])

  return null
}

const AddressMap = ({ center, zoom = 16, height = 320, onMarkerDragEnd, draggable = true }) => {
  const markerIcon = useMemo(
    () =>
      new L.Icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      }),
    []
  )

  return (
    <div className="map-container" style={{ height }}>
      <MapContainer center={center} zoom={zoom} scrollWheelZoom style={{ height: '100%', width: '100%' }}>
        <MapUpdater center={center} zoom={zoom} />
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker
          draggable={draggable}
          position={center}
          icon={markerIcon}
          eventHandlers={
            draggable
              ? {
                  dragend: (event) => {
                    const { lat, lng } = event.target.getLatLng()
                    onMarkerDragEnd?.(lat, lng)
                  },
                }
              : undefined
          }
        />
      </MapContainer>
    </div>
  )
}

export default AddressMap
