import { useEffect, useRef, forwardRef } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

interface MapProps {
  currentLocation: { lat: number; lon: number }
  destination: { lat: number; lon: number } | null
  route: any
}

export const MapComponent = forwardRef<HTMLDivElement, MapProps>(
  ({ currentLocation, destination, route }, ref) => {
    const mapContainer = useRef<HTMLDivElement>(null)
    const map = useRef<mapboxgl.Map | null>(null)

    useEffect(() => {
      if (!mapContainer.current) return

      // Inicializar mapa
      mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [currentLocation.lon, currentLocation.lat],
        zoom: 12,
      })

      // Agregar marcador de ubicación actual
      new mapboxgl.Marker({ color: '#2B5C8F' })
        .setLngLat([currentLocation.lon, currentLocation.lat])
        .addTo(map.current)

      // Agregar marcador de destino
      if (destination) {
        new mapboxgl.Marker({ color: '#FF9800' })
          .setLngLat([destination.lon, destination.lat])
          .addTo(map.current)
      }

      // Dibujar ruta si existe
      if (route && route.geometry) {
        if (map.current.getSource('route')) {
          map.current.removeLayer('route')
          map.current.removeSource('route')
        }

        map.current.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: route.geometry,
            properties: {},
          },
        })

        map.current.addLayer({
          id: 'route',
          type: 'line',
          source: 'route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': '#00BCD4',
            'line-width': 4,
            'line-opacity': 0.7,
          },
        })
      }

      return () => {
        map.current?.remove()
      }
    }, [currentLocation, destination, route])

    return <div ref={mapContainer} className="w-full h-full" />
  }
)

MapComponent.displayName = 'MapComponent'
