import { lazy } from 'react'
import { Route, Routes } from 'react-router-dom'
import RootLayout from './layouts/RootLayout.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import HomePage from './pages/HomePage.jsx'
import CarsPage from './pages/CarsPage.jsx'

// these pages are loaded only when the user opens them
const AboutPage = lazy(() => import('./pages/AboutPage.jsx'))
const CarDetailsPage = lazy(() => import('./pages/CarDetailsPage.jsx'))
const SellPage = lazy(() => import('./pages/SellPage.jsx'))
const DashboardPage = lazy(() => import('./pages/DashboardPage.jsx'))
const LoginPage = lazy(() => import('./pages/LoginPage.jsx'))
const SignupPage = lazy(() => import('./pages/SignupPage.jsx'))
const ProfilePage = lazy(() => import('./pages/ProfilePage.jsx'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage.jsx'))

export default function App() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route index element={<HomePage />} />
        <Route path="about" element={<AboutPage />} />

        <Route path="cars">
          <Route index element={<CarsPage />} />
          <Route path=":id" element={<CarDetailsPage />} />
        </Route>

        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="signup" element={<SignupPage />} />

        {/* only for logged in users, the others go to /login */}
        <Route element={<ProtectedRoute />}>
          <Route path="profile" element={<ProfilePage />} />
          <Route path="cars/new" element={<SellPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
