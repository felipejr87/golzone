import React from 'react'
import { Link } from 'react-router-dom'

export const Navbar: React.FC = () => {
  return (
    <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold">
          <span className="text-green-500">Gol</span>Zone
        </Link>
        <div className="flex gap-6 items-center">
          <Link to="/" className="hover:text-green-500 transition">Home</Link>
          <Link to="/admin/login" className="text-green-500 font-semibold hover:opacity-80 transition">Admin</Link>
        </div>
      </div>
    </nav>
  )
}