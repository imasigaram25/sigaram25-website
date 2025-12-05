import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-12 mb-12">
          {/* Brand Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <img 
                src="https://horizons-cdn.hostinger.com/e1d70592-6c37-4029-a5fd-237ef806c0cd/2e833d3d363e01fac06bc6462c876a64.jpg" 
                alt="IMA Hosur Logo" 
                className="h-10 w-10 rounded-full"
              />
              <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">
                IMA Hosur
              </h3>
            </div>
            <p className="text-gray-400 leading-relaxed">
              Committed to serving the community and advancing the medical profession in Hosur through excellence, ethics, and unity.
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="#" className="p-2 bg-gray-800 rounded-full hover:bg-blue-600 transition-colors duration-300 text-gray-300 hover:text-white">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </a>
              <a href="#" className="p-2 bg-gray-800 rounded-full hover:bg-blue-400 transition-colors duration-300 text-gray-300 hover:text-white">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </a>
              <a href="#" className="p-2 bg-gray-800 rounded-full hover:bg-blue-700 transition-colors duration-300 text-gray-300 hover:text-white">
                <Linkedin className="h-5 w-5" />
                <span className="sr-only">LinkedIn</span>
              </a>
              <a href="#" className="p-2 bg-gray-800 rounded-full hover:bg-pink-600 transition-colors duration-300 text-gray-300 hover:text-white">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-white">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <a href="#" onClick={(e) => { e.preventDefault(); document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' }); }} className="text-gray-400 hover:text-blue-400 transition-colors flex items-center">
                  <span className="mr-2">›</span> About Us
                </a>
              </li>
              <li>
                <a href="#" onClick={(e) => { e.preventDefault(); document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' }); }} className="text-gray-400 hover:text-blue-400 transition-colors flex items-center">
                  <span className="mr-2">›</span> Services
                </a>
              </li>
              <li>
                <a href="#" onClick={(e) => { e.preventDefault(); document.getElementById('events')?.scrollIntoView({ behavior: 'smooth' }); }} className="text-gray-400 hover:text-blue-400 transition-colors flex items-center">
                  <span className="mr-2">›</span> Upcoming Events
                </a>
              </li>
              <li>
                <a href="#" onClick={(e) => { e.preventDefault(); document.getElementById('members')?.scrollIntoView({ behavior: 'smooth' }); }} className="text-gray-400 hover:text-blue-400 transition-colors flex items-center">
                  <span className="mr-2">›</span> Membership
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-white">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 text-blue-500 mt-1 mr-3 flex-shrink-0" />
                <span className="text-gray-400">
                  Kumudepalli, Hosur - 635109<br />
                  Tamil Nadu, India
                </span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 text-blue-500 mr-3 flex-shrink-0" />
                <span className="text-gray-400">+91 94433 41102</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 text-blue-500 mr-3 flex-shrink-0" />
                <a href="mailto:info@imahosur.com" className="text-gray-400 hover:text-blue-400 transition-colors">
                  info@imahosur.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-800 text-center md:text-left flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm mb-4 md:mb-0">
            &copy; {currentYear} Indian Medical Association Hosur. All rights reserved.
          </p>
          <div className="flex space-x-6 text-sm text-gray-500">
            <a href="#" className="hover:text-blue-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-blue-400 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;