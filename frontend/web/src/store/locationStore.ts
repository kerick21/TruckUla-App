import { create } from 'zustand'

interface Location {
  lat: number
  lon: number
  address?: string
}

interface LocationStore {
  currentLocation: Location
  setCurrentLocation: (lat: number, lon: number, address?: string) => void
  updateCurrentLocation: (lat: number, lon: number) => void
}

export const useLocationStore = create<LocationStore>((set) => ({
  currentLocation: {
    lat: 39.8283,
    lon: -98.5795,
    address: 'Centro de EE.UU.',
  },
  setCurrentLocation: (lat: number, lon: number, address?: string) =>
    set({ currentLocation: { lat, lon, address } }),
  updateCurrentLocation: (lat: number, lon: number) =>
    set((state) => ({
      currentLocation: { ...state.currentLocation, lat, lon },
    })),
}))
