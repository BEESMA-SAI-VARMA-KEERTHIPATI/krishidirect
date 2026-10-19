import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, CartItem, ProduceListing, getRoleDashboardPath } from '../types';
import { api } from '../services/api';
import { Locale, translations } from '../services/i18n';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoadingAuth: boolean;
  currentPath: string;
  navigate: (path: string) => void;
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: typeof translations['en'];
  demoAccounts: any[];
  login: (email: string, password: string) => Promise<User>;
  register: (userData: any) => Promise<User>;
  logout: () => void;
  cart: CartItem[];
  addToCart: (listing: ProduceListing, quantity: number) => void;
  removeFromCart: (listingId: number) => void;
  clearCart: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isVoiceOpen: boolean;
  setIsVoiceOpen: (open: boolean) => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const pathToTab = (path: string): string => {
  const clean = path.replace(/\/$/, '') || '/';
  if (clean === '/' || clean === '/home') return 'home';
  if (clean === '/farmer/dashboard') return 'farmer-dashboard';
  if (clean === '/buyer/dashboard') return 'buyer-dashboard';
  if (clean === '/agent/dashboard') return 'agent-dashboard';
  if (clean === '/transporter/dashboard') return 'transporter-dashboard';
  if (clean === '/admin/dashboard') return 'admin-dashboard';
  if (clean === '/marketplace') return 'marketplace';
  if (clean === '/orders') return 'orders';
  if (clean === '/pooling') return 'pooling';
  return 'home';
};

const tabToPath = (tab: string, userRole?: string): string => {
  switch (tab) {
    case 'home':
      return '/';
    case 'farmer-dashboard':
      return '/farmer/dashboard';
    case 'buyer-dashboard':
      return '/buyer/dashboard';
    case 'agent-dashboard':
      return '/agent/dashboard';
    case 'transporter-dashboard':
      return '/transporter/dashboard';
    case 'admin-dashboard':
      return '/admin/dashboard';
    case 'marketplace':
      return userRole === 'buyer' ? '/buyer/dashboard' : '/marketplace';
    case 'orders':
      return '/orders';
    case 'pooling':
      return '/pooling';
    default:
      return '/';
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('krishi_token'));
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);
  const [currentPath, setCurrentPath] = useState<string>(window.location.pathname || '/');
  const [locale, setLocaleState] = useState<Locale>((localStorage.getItem('krishi_lang') as Locale) || 'en');
  const [demoAccounts, setDemoAccounts] = useState<any[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isVoiceOpen, setIsVoiceOpen] = useState<boolean>(false);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  const t = translations[locale] || translations.en;

  const navigate = (path: string) => {
    setCurrentPath(path);
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
  };

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    localStorage.setItem('krishi_lang', l);
  };

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    // 1. Fetch demo accounts list for reference only
    api.getDemoAccounts()
      .then((accs) => {
        setDemoAccounts(accs);
      })
      .catch((err) => {
        console.warn('Could not load demo accounts list:', err);
      });

    // 2. Authenticate existing session if token exists
    const storedToken = localStorage.getItem('krishi_token');
    if (storedToken) {
      api.getMe()
        .then((u) => {
          setUser(u);
          if (u.preferred_lang && ['en', 'hi', 'te'].includes(u.preferred_lang)) {
            setLocale(u.preferred_lang as Locale);
          }
        })
        .catch(() => {
          localStorage.removeItem('krishi_token');
          setToken(null);
          setUser(null);
        })
        .finally(() => {
          setIsLoadingAuth(false);
        });
    } else {
      setIsLoadingAuth(false);
    }
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    const res = await api.login({ email, password });
    localStorage.setItem('krishi_token', res.access_token);
    setToken(res.access_token);
    setUser(res.user);
    if (res.user.preferred_lang && ['en', 'hi', 'te'].includes(res.user.preferred_lang)) {
      setLocale(res.user.preferred_lang as Locale);
    }
    const dashboardRoute = getRoleDashboardPath(res.user.role);
    navigate(dashboardRoute);
    return res.user;
  };

  const register = async (userData: any): Promise<User> => {
    const res = await api.register(userData);
    localStorage.setItem('krishi_token', res.access_token);
    setToken(res.access_token);
    setUser(res.user);
    if (res.user.preferred_lang && ['en', 'hi', 'te'].includes(res.user.preferred_lang)) {
      setLocale(res.user.preferred_lang as Locale);
    }
    const dashboardRoute = getRoleDashboardPath(res.user.role);
    navigate(dashboardRoute);
    return res.user;
  };

  const logout = () => {
    localStorage.removeItem('krishi_token');
    setToken(null);
    setUser(null);
    setCart([]);
    navigate('/');
  };

  const activeTab = pathToTab(currentPath);
  const setActiveTab = (tab: string) => {
    const nextPath = tabToPath(tab, user?.role);
    navigate(nextPath);
  };

  const addToCart = (listing: ProduceListing, quantity: number) => {
    // Prevent farmers from using cart
    if (user?.role === 'farmer') return;
    setCart((prev) => {
      const existing = prev.find((item) => item.listing.id === listing.id);
      if (existing) {
        return prev.map((item) =>
          item.listing.id === listing.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, { listing, quantity }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (listingId: number) => {
    setCart((prev) => prev.filter((item) => item.listing.id !== listingId));
  };

  const clearCart = () => setCart([]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoadingAuth,
        currentPath,
        navigate,
        locale,
        setLocale,
        t,
        demoAccounts,
        login,
        register,
        logout,
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        activeTab,
        setActiveTab,
        isVoiceOpen,
        setIsVoiceOpen,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
