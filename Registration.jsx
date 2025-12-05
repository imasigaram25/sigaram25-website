import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import MembershipApplicationForm from '@/components/MembershipApplicationForm';

const Registration = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Helmet>
        <title>Membership Registration - IMA Hosur</title>
        <meta name="description" content="Join Indian Medical Association Hosur Branch. Apply for membership online." />
      </Helmet>
      
      <div className="min-h-screen bg-gray-50 pt-28 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center mb-10">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Membership Registration
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Welcome to IMA Hosur. Please complete the form below to apply for membership. 
                Ensure all details are accurate as per your medical registration certificate.
              </p>
            </div>
            
            <MembershipApplicationForm />
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default Registration;