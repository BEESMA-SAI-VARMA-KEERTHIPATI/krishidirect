import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, CartItem, ProduceListing } from '../types';
import { api } from '../services/api';
import { Locale, translations } from '../services/i18n';

interface AuthContextType {
  user: User | null;
  token: string | null;
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: typeof translations['en'];
  demoAccounts: any[];
  loginAsDemo: (account: any) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('krishi_token'));
  const [locale, setLocaleState] = useState<Locale>((localStorage.getItem('krishi_lang') as Locale) || 'en');
  const [demoAccounts, setDemoAccounts] = useState<any[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeTab, setActiveTab] = useState<string>('home');
  const [isVoiceOpen, setIsVoiceOpen] = useState<boolean>(false);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  const t = translations[locale] || translations.en;

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    localStorage.setItem('krishi_lang', l);
  };

  useEffect(() => {
    // Load demo accounts
    api.getDemoAccounts()
      .then((accs) => {
        setDemoAccounts(accs);
        // If no user is logged in, auto-login with Farmer demo account
        if (!localStorage.getItem('krishi_token') && accs.length > 0) {
          loginAsDemo(accs[0]);
        }
      })
      .catch(console.error);

    // If token exists, fetch me
    if (token) {
      api.getMe()
        .then((u) => setUser(u))
        .catch(() => {
          localStorage.removeItem('krishi_token');
          setToken(null);
          setUser(null);
        });
    }
  }, []);

  const loginAsDemo = async (account: any) => {
    try {
      const res = await api.login({ email: account.email, password: account.password });
      localStorage.setItem('krishi_token', res.access_token);
      setToken(res.access_token);
      setUser(res.user);
      if (res.user.preferred_lang && ['en', 'hi', 'te'].includes(res.user.preferred_lang)) {
        setLocale(res.user.preferred_lang as Locale);
      }
    } catch (err) {
      console.error('Demo login error:', err);
    }
  };

  const login = async (email: string, password: string) => {
    const res = await api.login({ email, password });
    localStorage.setItem('krishi_token', res.access_token);
    setToken(res.access_token);
    setUser(res.user);
  };

  const logout = () => {
    localStorage.removeItem('krishi_token');
    setToken(null);
    setUser(null);
  };

  const addToCart = (listing: ProduceListing, quantity: number) => {
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
        locale,
        setLocale,
        t,
        demoAccounts,
        loginAsDemo,
        login,
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
