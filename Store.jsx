import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import ProductsList from '@/components/ProductsList';

const Store = () => {
  return (
    <div className="min-h-screen bg-white pt-20">
      <Helmet>
        <title>Medical Store | IMA Hosur</title>
        <meta name="description" content="Browse and purchase medical supplies, merchandise, and event tickets from the Indian Medical Association Hosur branch." />
      </Helmet>

      {/* Hero Section for Store */}
      <div className="bg-gradient-to-b from-blue-50 to-white py-16 border-b border-blue-100/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block py-1 px-3 rounded-full bg-blue-100 text-blue-700 text-sm font-bold mb-4">
              Official Merchandise
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
              IMA Hosur <span className="text-blue-600">Store</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Support your local IMA branch by purchasing official merchandise, medical supplies, and event tickets directly from our store.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <ProductsList />
      </div>
    </div>
  );
};

export default Store;