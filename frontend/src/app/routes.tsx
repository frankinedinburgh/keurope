import { createBrowserRouter } from 'react-router';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Shop } from './pages/Shop';
import { ProductDetail } from './pages/ProductDetail';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { About } from './pages/About';
import { LogoPreview } from './pages/LogoPreview';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { NotFound } from './pages/NotFound';
import { ProtectedRoute } from './components/ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: 'shop', Component: Shop },
      { path: 'product/:id', Component: ProductDetail },
      { path: 'login', Component: Login },
      { path: 'register', Component: Register },
      {
        path: 'cart',
        Component: () => (
          <ProtectedRoute>
            <Cart />
          </ProtectedRoute>
        ),
      },
      {
        path: 'checkout',
        Component: () => (
          <ProtectedRoute>
            <Checkout />
          </ProtectedRoute>
        ),
      },
      { path: 'about', Component: About },
      { path: 'logo-preview', Component: LogoPreview },
      { path: '*', Component: NotFound },
    ],
  },
]);
