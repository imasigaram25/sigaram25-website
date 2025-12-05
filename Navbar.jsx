import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom'; 

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate(); 

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'Home', path: '/' }, 
    { name: 'About', href: '#about' },
    { name: 'Services', href: '#services' },
    { name: 'Events', href: '#events' },
    { name: 'Members', href: '#members' },
    { name: 'Contact', href: '#contact' }
  ];

  const handleNavigation = (item) => {
    setIsOpen(false); 
    if (item.path) {
      navigate(item.path); 
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (item.href) {
      const element = document.querySelector(item.href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleHomeClick = () => {
    navigate('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsOpen(false); 
  };

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-lg' : 'bg-white/95 backdrop-blur-sm'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-24">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-4 cursor-pointer" 
            onClick={handleHomeClick} 
          >
            <div className="flex items-center space-x-2">
              <img
                src="https://horizons-cdn.hostinger.com/e1d70592-6c37-4029-a5fd-237ef806c0cd/2e833d3d363e01fac06bc6462c876a64.jpg"
                alt="Indian Medical Association Logo"
                className="h-12 w-auto object-contain"
              />
              <img
                src="https://horizons-cdn.hostinger.com/e1d70592-6c37-4029-a5fd-237ef806c0cd/2445c4f9946c761cef9231403ce3ad6c.jpg"
                alt="HIMA Logo"
                className="h-12 w-auto object-contain"
              />
            </div>
            <div className="hidden sm:block">
              <span className="text-xl font-bold text-gray-900 block leading-none">IMA Hosur</span>
              <p className="text-xs text-gray-600 mt-1">Indian Medical Association</p>
            </div>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item, index) => (
              <motion.button
                key={item.name}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleNavigation(item)} 
                className="px-4 py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 hover:bg-blue-50 rounded-lg"
              >
                {item.name}
              </motion.button>
            ))}
            {/* REMOVED LOGIN LINKS */}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden bg-white border-t"
        >
          <div className="px-4 py-4 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => handleNavigation(item)} 
                className="block w-full text-left px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors duration-200 font-medium"
              >
                {item.name}
              </button>
            ))}
            {/* REMOVED LOGIN LINKS FROM MOBILE MENU */}
          </div>
        </motion.div>
      )}
    </nav>
  );
};

export default Navbar;