import { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, AlertCircle, User, Navigation } from 'lucide-react'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <nav className="w-20 bg-gray-900 text-white flex flex-col items-center py-4 gap-4">
        <Link
          to="/"
          className="p-3 hover:bg-gray-800 rounded-lg transition"
          title="Mapa"
        >
          <MapPin size={24} />
        </Link>
        <Link
          to="/navigation"
          className="p-3 hover:bg-gray-800 rounded-lg transition"
          title="Navegación"
        >
          <Navigation size={24} />
        </Link>
        <Link
          to="/reports"
          className="p-3 hover:bg-gray-800 rounded-lg transition"
          title="Reportes"
        >
          <AlertCircle size={24} />
        </Link>
        <Link
          to="/profile"
          className="p-3 hover:bg-gray-800 rounded-lg transition mt-auto"
          title="Perfil"
        >
          <User size={24} />
        </Link>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}
