import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import MyTickets from './pages/MyTickets';
import CreateTicket from './pages/CreateTicket';
import TicketDetails from './pages/TicketDetails';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import AdminTickets from './pages/AdminTickets';
import AdminDashboard from './pages/AdminDashboard';
import UserManagement from './pages/UserManagement';
import ProductManagement from './pages/ProductManagement';
import StaffDashboard from './pages/StaffDashboard';
import TicketManagement from './pages/TicketManagement';
import StaffTicketDetails from './pages/StaffTicketDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import MyOrders from './pages/MyOrders';
import OrderManagement from './pages/OrderManagement';
import Profile from './pages/Profile';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (adminOnly && user.role !== 'admin' && user.role !== 'support') {
    return <Navigate to="/" />;
  }

  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" />;
  }

  return children;
};

function AppContent() {
  return (
    <Router>
      <Routes>
        {/* Admin Routes - No Layout Wrapper */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/users"
          element={
            <ProtectedRoute adminOnly={true}>
              <UserManagement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/products"
          element={
            <ProtectedRoute adminOnly={true}>
              <ProductManagement />
            </ProtectedRoute>
          }
        />

        {/* Staff Routes - No Layout Wrapper */}
        <Route
          path="/staff/dashboard"
          element={
            <ProtectedRoute adminOnly={true}>
              <StaffDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/ticket-management"
          element={
            <ProtectedRoute adminOnly={true}>
              <TicketManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/tickets/:id"
          element={
            <ProtectedRoute adminOnly={true}>
              <StaffTicketDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/orders"
          element={
            <ProtectedRoute adminOnly={true}>
              <OrderManagement />
            </ProtectedRoute>
          }
        />

        {/* All Other Routes - With Layout Wrapper */}
        <Route
          path="*"
          element={
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />

                <Route path="/products" element={<Products />} />

                <Route path="/products/:id" element={<ProductDetail />} />

                <Route
                  path="/cart"
                  element={
                    <ProtectedRoute>
                      <Cart />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/checkout"
                  element={
                    <ProtectedRoute>
                      <Checkout />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/my-orders"
                  element={
                    <ProtectedRoute>
                      <MyOrders />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/orders/:id"
                  element={
                    <ProtectedRoute>
                      <MyOrders />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/login"
                  element={
                    <PublicRoute>
                      <Login />
                    </PublicRoute>
                  }
                />

                <Route
                  path="/register"
                  element={
                    <PublicRoute>
                      <Register />
                    </PublicRoute>
                  }
                />

                <Route
                  path="/my-tickets"
                  element={
                    <ProtectedRoute>
                      <MyTickets />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/create-ticket"
                  element={
                    <ProtectedRoute>
                      <CreateTicket />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/tickets/:id"
                  element={
                    <ProtectedRoute>
                      <TicketDetails />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/admin/tickets"
                  element={
                    <ProtectedRoute adminOnly={true}>
                      <AdminTickets />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/admin/tickets/:id"
                  element={
                    <ProtectedRoute adminOnly={true}>
                      <TicketDetails />
                    </ProtectedRoute>
                  }
                />


                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </Layout>
          }
        />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;