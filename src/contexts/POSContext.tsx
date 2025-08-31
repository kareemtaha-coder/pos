import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product, Customer, PaymentMethod } from '../types';
import { supabase } from '../lib/supabase';

interface POSContextType {
  cart: CartItem[];
  customer: Customer | null;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartItemQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  setCustomer: (customer: Customer | null) => void;
  calculateSubtotal: () => number;
  calculateTax: () => number;
  calculateTotal: () => number;
  discountAmount: number;
  discountPercentage: number;
  setDiscountAmount: (amount: number) => void;
  setDiscountPercentage: (percentage: number) => void;
  processSale: (paymentMethods: PaymentMethod[]) => Promise<{ success: boolean; invoiceId?: string; error?: string }>;
}

const POSContext = createContext<POSContextType | undefined>(undefined);

export const usePOS = () => {
  const context = useContext(POSContext);
  if (context === undefined) {
    throw new Error('usePOS must be used within a POSProvider');
  }
  return context;
};

export const POSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountPercentage, setDiscountPercentage] = useState(0);

  const addToCart = (product: Product, quantity = 1) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product.id === product.id);
      
      if (existingItem) {
        return prevCart.map(item =>
          item.product.id === product.id
            ? {
                ...item,
                quantity: item.quantity + quantity,
                total_price: (item.quantity + quantity) * item.unit_price - item.discount_amount
              }
            : item
        );
      }
      
      return [...prevCart, {
        product,
        quantity,
        unit_price: product.selling_price,
        discount_amount: 0,
        total_price: quantity * product.selling_price
      }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.product.id !== productId));
  };

  const updateCartItemQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCart(prevCart =>
      prevCart.map(item =>
        item.product.id === productId
          ? {
              ...item,
              quantity,
              total_price: quantity * item.unit_price - item.discount_amount
            }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    setCustomer(null);
    setDiscountAmount(0);
    setDiscountPercentage(0);
  };

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + item.total_price, 0);
  };

  const calculateTax = () => {
    const subtotal = calculateSubtotal();
    const discountedSubtotal = subtotal - discountAmount - (subtotal * discountPercentage / 100);
    return discountedSubtotal * 0.15; // 15% VAT
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const finalDiscount = discountAmount + (subtotal * discountPercentage / 100);
    const discountedSubtotal = subtotal - finalDiscount;
    const tax = discountedSubtotal * 0.15;
    return discountedSubtotal + tax;
  };

  const processSale = async (paymentMethods: PaymentMethod[]) => {
    try {
      const subtotal = calculateSubtotal();
      const finalDiscountAmount = discountAmount + (subtotal * discountPercentage / 100);
      const taxAmount = calculateTax();
      const totalAmount = calculateTotal();
      const paidAmount = paymentMethods.reduce((sum, method) => sum + method.amount, 0);
      
      // Generate invoice number
      const invoiceNumber = `INV-${Date.now()}`;
      
      // Determine payment status
      let paymentStatus: 'paid' | 'pending' | 'partial' = 'paid';
      if (paidAmount < totalAmount) {
        paymentStatus = paidAmount > 0 ? 'partial' : 'pending';
      }
      
      // Create sale record
      const { data: saleData, error: saleError } = await supabase
        .from('sales')
        .insert({
          invoice_number: invoiceNumber,
          customer_id: customer?.id,
          subtotal,
          discount_amount: finalDiscountAmount,
          discount_percentage: discountPercentage,
          tax_amount: taxAmount,
          total_amount: totalAmount,
          paid_amount: paidAmount,
          payment_method: paymentMethods[0]?.type || 'cash',
          payment_status: paymentStatus,
        })
        .select()
        .single();

      if (saleError) throw saleError;

      // Create sale items
      const saleItems = cart.map(item => ({
        sale_id: saleData.id,
        product_id: item.product.id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        discount_amount: item.discount_amount,
        total_price: item.total_price,
      }));

      const { error: itemsError } = await supabase
        .from('sale_items')
        .insert(saleItems);

      if (itemsError) throw itemsError;

      // Update inventory
      for (const item of cart) {
        const { error: stockError } = await supabase
          .from('products')
          .update({
            stock_quantity: item.product.stock_quantity - item.quantity
          })
          .eq('id', item.product.id);

        if (stockError) throw stockError;
      }

      // Update customer balance if credit sale
      if (customer && paymentStatus !== 'paid') {
        const { error: customerError } = await supabase
          .from('customers')
          .update({
            current_balance: customer.current_balance + (totalAmount - paidAmount)
          })
          .eq('id', customer.id);

        if (customerError) throw customerError;
      }

      clearCart();
      return { success: true, invoiceId: saleData.id };
    } catch (error) {
      console.error('Error processing sale:', error);
      return { success: false, error: 'فشل في معالجة البيع. يرجى المحاولة مرة أخرى.' };
    }
  };

  const value = {
    cart,
    customer,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    setCustomer,
    calculateSubtotal,
    calculateTax,
    calculateTotal,
    discountAmount,
    discountPercentage,
    setDiscountAmount,
    setDiscountPercentage,
    processSale,
  };

  return <POSContext.Provider value={value}>{children}</POSContext.Provider>;
};