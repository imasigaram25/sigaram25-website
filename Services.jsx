import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, HeartPulse, BookOpen, Users, Briefcase, Award } from 'lucide-react';
const Services = () => {
  const services = [{
    icon: GraduationCap,
    title: 'Continuing Medical Education',
    description: 'Regular CME programs, workshops, and seminars to keep our members updated with the latest medical advancements and best practices.',
    color: 'from-blue-500 to-blue-600'
  }, {
    icon: HeartPulse,
    title: 'Health Camps & Awareness',
    description: 'Organizing free health camps, screening programs, and awareness campaigns for the community on various health issues.',
    color: 'from-green-500 to-green-600'
  }, {
    icon: BookOpen,
    title: 'Medical Research Support',
    description: 'Encouraging and supporting medical research initiatives, publications, and evidence-based practice among members.',
    color: 'from-purple-500 to-purple-600'
  }, {
    icon: Users,
    title: 'Professional Networking',
    description: 'Creating opportunities for medical professionals to connect, collaborate, and share knowledge across specialties.',
    color: 'from-orange-500 to-orange-600'
  }, {
    icon: Briefcase,
    title: 'Practice Management',
    description: 'Guidance on ethical medical practice, legal aspects, and practice management for medical professionals.',
    color: 'from-cyan-500 to-cyan-600'
  }, {
    icon: Award,
    title: 'Recognition & Awards',
    description: 'Honoring excellence in medical practice, research, and community service through various awards and recognition programs.',
    color: 'from-pink-500 to-pink-600'
  }];
  return <section id="services" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} whileInView={{
        opacity: 1,
        y: 0
      }} viewport={{
        once: true
      }} transition={{
        duration: 0.6
      }} className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Our Services
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Comprehensive programs and initiatives designed to support medical professionals 
            and serve the healthcare needs of our community.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => <motion.div key={index} initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} transition={{
          duration: 0.6,
          delay: index * 0.1
        }} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group hover:-translate-y-1">
              <div className={`w-16 h-16 bg-gradient-to-br ${service.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <service.icon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{service.title}</h3>
              <p className="text-gray-600 leading-relaxed">{service.description}</p>
            </motion.div>)}
        </div>

        <motion.div initial={{
        opacity: 0,
        y: 20
      }} whileInView={{
        opacity: 1,
        y: 0
      }} viewport={{
        once: true
      }} transition={{
        duration: 0.6
      }} className="mt-16 bg-white rounded-2xl p-8 shadow-lg">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Member Benefits</h3>
              <ul className="space-y-3">
                {['Access to exclusive CME programs and workshops', 'Networking opportunities with medical professionals', 'Professional development resources', 'Legal and ethical practice guidance', 'Discounted rates for conferences and events', 'Recognition and awards programs', 'Community service opportunities', 'Medical journal subscriptions'].map((benefit, index) => <li key={index} className="flex items-start">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    </div>
                    <span className="text-gray-700">{benefit}</span>
                  </li>)}
              </ul>
            </div>
            <div className="relative">
              <img alt="Medical professionals in conference" className="rounded-xl shadow-lg" src="https://horizons-cdn.hostinger.com/e1d70592-6c37-4029-a5fd-237ef806c0cd/whatsapp-image-2025-11-28-at-2.43.02-pm-1-fpOjW.jpeg" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>;
};
export default Services;