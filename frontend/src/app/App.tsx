import { RouterProvider } from 'react-router';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { AdminProvider } from './context/AdminContext';
import { ToastProvider } from './context/ToastContext';
import { router } from './routes';

export default function App() {
  return (
    <AuthProvider>
      <AdminProvider>
        <CartProvider>
          <ToastProvider>
            <RouterProvider router={router} />
          </ToastProvider>
        </CartProvider>
      </AdminProvider>
    </AuthProvider>
  );
}
