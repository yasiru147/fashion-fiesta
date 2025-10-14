import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cartItemCount, setCartItemCount] = useState(0);

  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Fetch cart
  const fetchCart = async () => {
    if (!user) {
      setCart(null);
      setCartItemCount(0);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/cart', {
        headers: getAuthHeader()
      });

      if (response.data.success) {
        setCart(response.data.cart);
        setCartItemCount(response.data.cart.totalItems || 0);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      setCart(null);
      setCartItemCount(0);
    } finally {
      setLoading(false);
    }
  };

  // Add item to cart
  const addToCart = async (productId, quantity = 1, selectedSize = null, selectedColor = null) => {
    try {
      const response = await axios.post(
        'http://localhost:5000/api/cart/add',
        { productId, quantity, selectedSize, selectedColor },
        { headers: getAuthHeader() }
      );

      if (response.data.success) {
        setCart(response.data.cart);
        setCartItemCount(response.data.cart.totalItems || 0);
        return { success: true, message: response.data.message };
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error adding to cart'
      };
    }
  };

  // Update cart item quantity
  const updateCartItem = async (itemId, quantity) => {
    try {
      const response = await axios.put(
        `http://localhost:5000/api/cart/update/${itemId}`,
        { quantity },
        { headers: getAuthHeader() }
      );

      if (response.data.success) {
        setCart(response.data.cart);
        setCartItemCount(response.data.cart.totalItems || 0);
        return { success: true, message: response.data.message };
      }
    } catch (error) {
      console.error('Error updating cart:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error updating cart'
      };
    }
  };

  // Remove item from cart
  const removeFromCart = async (itemId) => {
    try {
      const response = await axios.delete(
        `http://localhost:5000/api/cart/remove/${itemId}`,
        { headers: getAuthHeader() }
      );

      if (response.data.success) {
        setCart(response.data.cart);
        setCartItemCount(response.data.cart.totalItems || 0);
        return { success: true, message: response.data.message };
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error removing from cart'
      };
    }
  };

  // Clear cart
  const clearCart = async () => {
    try {
      const response = await axios.delete('http://localhost:5000/api/cart/clear', {
        headers: getAuthHeader()
      });

      if (response.data.success) {
        setCart(response.data.cart);
        setCartItemCount(0);
        return { success: true, message: response.data.message };
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error clearing cart'
      };
    }
  };

  // Fetch cart when user changes
  useEffect(() => {
    fetchCart();
  }, [user]);

  const value = {
    cart,
    loading,
    cartItemCount,
    fetchCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
