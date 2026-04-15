import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { MapContainer } from './pages/MapContainer'
import { Navigation } from './pages/Navigation'
import { Reports } from './pages/Reports'
import { Profile } from './pages/Profile'
import { Layout } from './components/Layout'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<MapContainer />} />
            <Route path="/navigation" element={<Navigation />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </Layout>
      </Router>
    </QueryClientProvider>
  )
}

export default App
