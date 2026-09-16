import { Routes, Route, Navigate } from 'react-router-dom'
import Nav from './components/Nav'
import Footer from './components/Footer'
import WhatsAppFab from './components/WhatsAppFab'
import Home from './pages/Home'
import Menu from './pages/Menu'
import CustomOrders from './pages/CustomOrders'
import Locations from './pages/Locations'
import About from './pages/About'
import NotFound from './pages/NotFound'
import AdminLogin from './admin/AdminLogin'
import AdminLayout from './admin/AdminLayout'
import AdminProducts from './admin/AdminProducts'
import AdminBranches from './admin/AdminBranches'
import AdminPromotions from './admin/AdminPromotions'
import AdminSettings from './admin/AdminSettings'

function PublicSite() {
  return (
    <>
      <Nav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/custom-orders" element={<CustomOrders />} />
        <Route path="/locations" element={<Locations />} />
        <Route path="/about" element={<About />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
      <WhatsAppFab />
    </>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="products" replace />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="branches" element={<AdminBranches />} />
        <Route path="promotions" element={<AdminPromotions />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>
      <Route path="/*" element={<PublicSite />} />
    </Routes>
  )
  }
