import { Routes, Route, Navigate } from 'react-router-dom'
import { Nav, Footer, WhatsAppFab, Home, Menu, CustomOrders, Locations, About, NotFound, AdminLogin, AdminLayout, AdminProducts, AdminBranches, AdminPromotions, AdminSettings } from './bundle'

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
