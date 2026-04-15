import { create } from 'zustand'

interface Location {
  lat: number
  lon: number
  address?: string
}

interface MapStore {
  destination: Location | null
  setDestination: (location: Location | null) => void
  selectedHeight: number
  setSelectedHeight: (height: number) => void
  isNavigating: boolean
  setIsNavigating: (value: boolean) => void
  reports: any[]
  addReport: (report: any) => void
}

export const useMapStore = create<MapStore>((set) => ({
  destination: null,
  setDestination: (location) => set({ destination: location }),
  selectedHeight: 12.6,
  setSelectedHeight: (height) => set({ selectedHeight: height }),
  isNavigating: false,
  setIsNavigating: (value) => set({ isNavigating: value }),
  reports: [],
  addReport: (report) =>
    set((state) => ({ reports: [...state.reports, report] })),
}))
