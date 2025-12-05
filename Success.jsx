import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';

const Success = () => {
  const { clearCart } = useCart();

  useEffect(() => {
    // Ensure cart is cleared on successful return from payment
    clearCart();
  }, [clearCart]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white max-w-lg w-full rounded-3xl shadow-xl overflow-hidden border border-gray-100"
      >
        <div className="bg-green-50 p-10 flex justify-center">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center shadow-inner">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
        </div>
        
        <div className="p-10 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Payment Successful!</h1>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Thank you for your purchase. Your order has been processed successfully. A confirmation email has been sent to your registered email address.
          </p>
          
          <div className="flex flex-col gap-3">
            <Link to="/store">
              <Button className="w-full py-6 bg-blue-600 hover:bg-blue-700 text-lg">
                Continue Shopping <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link to="/">
              <Button variant="ghost" className="w-full text-gray-500 hover:text-gray-700">
                <Home className="mr-2 w-4 h-4" /> Return to Home
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Success;