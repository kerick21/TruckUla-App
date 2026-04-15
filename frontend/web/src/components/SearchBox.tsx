import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { Search, MapPin } from 'lucide-react'

interface SearchBoxProps {
  onDestinationSelect: (location: { lat: number; lon: number; address: string }) => void
}

export function SearchBox({ onDestinationSelect }: SearchBoxProps) {
  const [query, setQuery] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)

  const { data: suggestions } = useQuery({
    queryKey: ['geocode', query],
    queryFn: async () => {
      if (query.length < 3) return []
      
      const response = await axios.get('/api/search/geocode', {
        params: { q: query },
      })
      return response.data
    },
    enabled: query.length >= 3,
  })

  const handleSelect = (suggestion: any) => {
    onDestinationSelect({
      lat: suggestion.lat,
      lon: suggestion.lon,
      address: suggestion.address,
    })
    setQuery('')
    setShowSuggestions(false)
  }

  return (
    <div className="absolute top-4 left-4 w-80 z-10">
      <div className="bg-white rounded-lg shadow-lg p-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="¿A dónde quieres ir?"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setShowSuggestions(true)
            }}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {showSuggestions && suggestions && suggestions.length > 0 && (
          <div className="mt-2 max-h-64 overflow-y-auto">
            {suggestions.map((suggestion: any, index: number) => (
              <button
                key={index}
                onClick={() => handleSelect(suggestion)}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 border-b last:border-b-0"
              >
                <MapPin size={16} className="text-gray-400" />
                <div>
                  <p className="font-medium text-sm">{suggestion.name}</p>
                  <p className="text-xs text-gray-500">{suggestion.address}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
