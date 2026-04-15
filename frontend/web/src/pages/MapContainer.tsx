import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { MapComponent } from '../components/Map'
import { SearchBox } from '../components/SearchBox'
import { useLocationStore } from '../store/locationStore'
import { useMapStore } from '../store/mapStore'
import axios from 'axios'

export function MapContainer() {
  const mapRef = useRef(null)
  const { currentLocation, setCurrentLocation } = useLocationStore()
  const { destination, setDestination } = useMapStore()
  const [isLoading, setIsLoading] = useState(true)

  // Obtener ubicación actual del usuario
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setCurrentLocation(latitude, longitude)
          setIsLoading(false)
        },
        (error) => {
          console.error('Error obteniendo ubicación:', error)
          // Fallback a ubicación por defecto
          setCurrentLocation(39.8283, -98.5795)
          setIsLoading(false)
        }
      )
    }
  }, [setCurrentLocation])

  // Buscar ruta cuando hay destino
  const { data: route } = useQuery({
    queryKey: ['route', currentLocation, destination],
    queryFn: async () => {
      if (!destination) return null
      
      const response = await axios.get('/api/routing/calculate', {
        params: {
          origin: `${currentLocation.lat},${currentLocation.lon}`,
          destination: `${destination.lat},${destination.lon}`,
        },
      })
      return response.data
    },
    enabled: !!destination && !!currentLocation,
  })

  return (
    <div className="relative w-full h-screen">
      {isLoading ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p>Obteniendo tu ubicación...</p>
          </div>
        </div>
      ) : (
        <>
          <MapComponent
            ref={mapRef}
            currentLocation={currentLocation}
            destination={destination}
            route={route}
          />
          <SearchBox onDestinationSelect={setDestination} />
          
          {route && (
            <div className="absolute bottom-4 left-4 bg-white p-4 rounded-lg shadow-lg">
              <h3 className="font-bold text-lg">Ruta calculada</h3>
              <p className="text-gray-600">{route.distance} km</p>
              <p className="text-gray-600">{route.duration} minutos</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
