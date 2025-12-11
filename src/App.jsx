import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import MainLayout from './layout/MainLayout.jsx';
import Home from './pages/Home.jsx';
import SongsPage from './pages/Songs.jsx';
import ArtistsPage from './pages/Artists.jsx';
import AchievementsPage from './pages/Achievements.jsx';
import QueriesPage from './pages/Queries.jsx';
import CartPage from './pages/Cart.jsx';
import OliveAudioLab from './OliveAudioLab.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { CatalogProvider } from './context/CatalogContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import LoginPage from './pages/Login.jsx';
import ProtectedRoute from './components/routing/ProtectedRoute.jsx';

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <CatalogProvider>
        <CartProvider>
          <Routes>
            <Route index element={<OliveAudioLab />} />
            <Route path="/login" element={<LoginPage />} />
            <Route
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/overview" element={<Home />} />
              <Route path="/songs" element={<SongsPage />} />
              <Route path="/artists" element={<ArtistsPage />} />
              <Route path="/achievements" element={<AchievementsPage />} />
              <Route path="/queries" element={<QueriesPage />} />
              <Route path="/cart" element={<CartPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/overview" replace />} />
          </Routes>
        </CartProvider>
      </CatalogProvider>
    </AuthProvider>
  </BrowserRouter>
);

export default App;
