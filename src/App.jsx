import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { LayoutDashboard, Car, PlusCircle, LogOut, User } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Veiculos from './pages/Veiculos';
import NovoVeiculo from './pages/NovoVeiculo';
import DetalhesVeiculo from './pages/DetalhesVeiculo';
import VoiceAgent from './components/VoiceAgent';

function Navigation() {
  const location = useLocation();
  const { user, signOut } = useAuth();
  
  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleLogout = async () => {
    await signOut();
  };

  // Não mostrar navegação na página de login
  if (location.pathname === '/login') {
    return null;
  }

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <Car className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-800">Sistema de Veículos</span>
          </div>
          
          <div className="flex items-center space-x-1">
            <Link 
              to="/" 
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                isActive('/') 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span className="font-medium">Dashboard</span>
            </Link>
            
            <Link 
              to="/veiculos" 
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                isActive('/veiculos') 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Car className="w-5 h-5" />
              <span className="font-medium">Veículos</span>
            </Link>
            
            <Link 
              to="/novo-veiculo" 
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                isActive('/novo-veiculo') 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <PlusCircle className="w-5 h-5" />
              <span className="font-medium">Novo Veículo</span>
            </Link>

            {/* Informações do Usuário */}
            <div className="ml-4 flex items-center space-x-3 pl-4 border-l border-gray-200">
              <div className="flex items-center space-x-2 text-gray-700">
                <User className="w-5 h-5" />
                <span className="text-sm font-medium">{user?.email}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Sair"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium text-sm">Sair</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

function AppContent() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/veiculos" 
            element={
              <ProtectedRoute>
                <Veiculos />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/novo-veiculo" 
            element={
              <ProtectedRoute>
                <NovoVeiculo />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/veiculos/:id" 
            element={
              <ProtectedRoute>
                <DetalhesVeiculo />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </main>
      {user && <VoiceAgent />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
