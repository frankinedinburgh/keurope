import { Link, useNavigate } from 'react-router';
import { ShoppingBag, Menu, X, LogOut } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import logo from '../../imports/keurope-logo.svg';

export function Header() {
  const { totalItems } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img
              src={logo}
              alt="keurope"
              className="h-10 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/shop" className="text-sm hover:text-neutral-600 transition-colors">
              Shop
            </Link>
            <Link to="/about" className="text-sm hover:text-neutral-600 transition-colors">
              About
            </Link>
          </nav>

          {/* Cart Icon & Auth */}
          <div className="flex items-center gap-4">
            <Link to="/cart" className="relative">
              <ShoppingBag className="size-5" />
              {totalItems > 0 && (
                <span className="absolute -right-2 -top-2 flex size-5 items-center justify-center rounded-full bg-black text-xs text-white">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Auth Links */}
            <div className="hidden md:flex items-center gap-4">
              {user ? (
                <>
                  <span className="text-sm text-gray-600">{user.email}</span>
                  <button
                    onClick={handleLogout}
                    className="text-sm hover:text-neutral-600 transition-colors flex items-center gap-1"
                  >
                    <LogOut className="size-4" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-sm hover:text-neutral-600 transition-colors">
                    Login
                  </Link>
                  <Link to="/register" className="text-sm font-medium text-black hover:text-gray-700 transition-colors">
                    Register
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="md:hidden border-t py-4 flex flex-col gap-4">
            <Link
              to="/shop"
              className="text-sm hover:text-neutral-600 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Shop
            </Link>
            <Link
              to="/about"
              className="text-sm hover:text-neutral-600 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </Link>
            <div className="border-t pt-4 flex flex-col gap-2">
              {user ? (
                <>
                  <span className="text-sm text-gray-600">{user.email}</span>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="text-sm hover:text-neutral-600 transition-colors flex items-center gap-1"
                  >
                    <LogOut className="size-4" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-sm hover:text-neutral-600 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="text-sm font-medium text-black hover:text-gray-700 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
