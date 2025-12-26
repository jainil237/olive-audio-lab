import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { CartProvider } from './context/CartContext.jsx';
import { CatalogProvider } from './context/CatalogContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import ProtectedRoute from './components/routing/ProtectedRoute.jsx';
import LoadingScreen from './components/ui/LoadingScreen.jsx';
import MainLayout from './layout/MainLayout.jsx'; // Keep Layout static for structure, or lazy load if desired. Let's keep layout static for now to avoid layout shift, or lazy load pages inside.
// Actually, lazy loading layout is fine too.

// Lazy Load Pages
// Added artificial delay of 2 seconds to simulate slow connection
const OliveAudioLab = lazy(() => import('./OliveAudioLab.jsx'));
const Home = lazy(() => import('./pages/Home.jsx'));
const SongsPage = lazy(() => import('./pages/Songs.jsx'));
const ArtistsPage = lazy(() => import('./pages/Artists.jsx'));
const AchievementsPage = lazy(() => import('./pages/Achievements.jsx'));
const QueriesPage = lazy(() => import('./pages/Queries.jsx'));
const QueriesListingPage = lazy(() => import('./pages/QueriesListing.jsx'));
const LoginPage = lazy(() => import('./pages/Login.jsx'));
const SignupPage = lazy(() => import('./pages/Signup.jsx'));

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <CatalogProvider>
        <CartProvider>
          <Suspense fallback={<LoadingScreen />}>
            <Routes>
              <Route index element={<OliveAudioLab />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
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
                {/* <Route path="/cart" element={<CartPage />} /> */}
                <Route path="/queries-listing" element={<QueriesListingPage />} />
              </Route>
              <Route path="*" element={<Navigate to="/overview" replace />} />
            </Routes>
          </Suspense>
        </CartProvider>
      </CatalogProvider>
    </AuthProvider>
  </BrowserRouter>
);

export default App;
