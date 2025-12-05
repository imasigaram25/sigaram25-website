import React from 'react';
import { motion } from 'framer-motion';
import { Target, Eye, Award, Users } from 'lucide-react';
const About = () => {
  const features = [{
    icon: Target,
    title: 'Our Mission',
    description: 'To promote the highest standards of medical practice, ethics, and patient care while fostering professional development among medical practitioners.'
  }, {
    icon: Eye,
    title: 'Our Vision',
    description: 'To be the leading medical association in the region, recognized for excellence in healthcare advocacy and community health initiatives.'
  }, {
    icon: Award,
    title: 'Our Values',
    description: 'Integrity, excellence, compassion, and continuous learning form the foundation of our commitment to healthcare and community service.'
  }, {
    icon: Users,
    title: 'Our Community',
    description: 'A vibrant network of dedicated medical professionals working together to advance healthcare standards and serve the community.'
  }];
  return <section id="about" className="py-20 bg-white">
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
            About IMA Hosur
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            The Indian Medical Association Hosur branch has been at the forefront of healthcare excellence, 
            bringing together medical professionals dedicated to advancing the field of medicine and serving our community.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {features.map((feature, index) => <motion.div key={index} initial={{
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
        }} className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-xl hover:shadow-lg transition-shadow duration-300">
              <div className="w-14 h-14 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                <feature.icon className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
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
      }} className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-8 md:p-12 text-white">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-3xl font-bold mb-4">Our History</h3>
              <p className="text-blue-100 leading-relaxed mb-4">IMA Hosur has grown from a small group of dedicated doctors to a thriving association of over 500 doctors. We have consistently worked towards improving healthcare standards, organizing medical camps, and providing continuing medical education to our members.</p>
              <p className="text-blue-100 leading-relaxed">
                Our commitment to excellence and community service has made us a trusted name in healthcare advocacy 
                and professional development in the Hosur region and beyond.
              </p>
            </div>
            <div className="relative">
              <img alt="IMA Hosur House Building" className="rounded-xl shadow-2xl w-full h-full object-cover border-4 border-white/20" src="https://horizons-cdn.hostinger.com/e1d70592-6c37-4029-a5fd-237ef806c0cd/0db8b979b2326a5a5151e90ddb44ede3.png" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>;
};
export default About;