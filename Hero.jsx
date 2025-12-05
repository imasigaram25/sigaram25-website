import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Award, UserCheck, Landmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
const Hero = () => {
  const leadership = [{
    role: "President",
    name: "Dr. Sreenivasa Gowda",
    affiliation: "Sreenivasa Speciality Hospital, Hosur",
    icon: Award,
    image: null
  }, {
    role: "Secretary",
    name: "Dr. Rahul Ravindran",
    affiliation: "Swasthi Clinic, Hosur",
    icon: UserCheck,
    image: "https://horizons-cdn.hostinger.com/e1d70592-6c37-4029-a5fd-237ef806c0cd/602e03bb6876ed71ccb6001824eab2fc.jpg"
  }, {
    role: "Finance Secretary",
    name: "Dr. Pravin Kumaar",
    affiliation: "Asst. Professor, Krishnagiri Medical College Hospitals",
    icon: Landmark,
    image: null
  }];
  return <div className="relative min-h-screen bg-gray-900 flex flex-col pt-16 md:pt-20"> {/* Top Image Section */} <div className="relative w-full shrink-0 bg-gray-900 flex justify-center items-center overflow-visible md:overflow-hidden"> <img alt="Group photo of Indian Medical Association members in traditional attire, standing and sitting on a stage with IMA Hosur branding in the background." src="https://horizons-cdn.hostinger.com/e1d70592-6c37-4029-a5fd-237ef806c0cd/ima-hall-welcome---copy-nb5pJ.jpeg" className="w-full h-auto object-contain md:h-[80vh] md:object-cover" /> {/* Gradient Overlay to blend image into the content below */} <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" /> </div> {/* Text & Content Section - Positioned completely below the image */} <div className="relative z-10 flex-grow flex flex-col justify-start px-4 sm:px-6 lg:px-8 py-12 bg-gray-900"> <div className="max-w-7xl mx-auto w-full"> {/* Main Text Content */} <motion.div initial={{
          opacity: 0,
          y: 30
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.6
        }} className="text-center mb-16"> <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight leading-tight drop-shadow-lg"> Excellence in <br className="hidden sm:block" /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300"> Healthcare & Community </span> </h1> <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto mb-10 leading-relaxed"> United to promote the art and science of medicine and the betterment of public health </p> <div className="flex flex-col sm:flex-row gap-4 justify-center"> <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg shadow-blue-900/20 shadow-xl" onClick={() => document.getElementById('members')?.scrollIntoView({
              behavior: 'smooth'
            })}> Join Our Community <ArrowRight className="ml-2 h-5 w-5" /> </Button> <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 bg-gray-800/50 backdrop-blur-sm px-8 py-6 text-lg" onClick={() => document.getElementById('about')?.scrollIntoView({
              behavior: 'smooth'
            })}> About Us </Button> </div> </motion.div> {/* Leadership Cards */} <motion.div initial={{
          opacity: 0,
          y: 40
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} transition={{
          duration: 0.8,
          delay: 0.2
        }} className="bg-white rounded-2xl p-6 md:p-8 shadow-2xl border border-gray-200"> <div className="text-center mb-8"> <h3 className="text-2xl font-bold text-gray-900">Board Members</h3> <div className="w-16 h-1 bg-blue-600 mx-auto mt-2 rounded-full"></div> </div> <div className="grid md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-gray-200"> {leadership.map((leader, index) => <div key={index} className="flex flex-col items-center text-center px-4 pt-4 md:pt-0"> <div className="mb-3"> {leader.image ? <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-blue-100 mx-auto shadow-sm"> <img src={leader.image} alt={leader.name} className="w-full h-full object-cover" /> </div> : <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto border-2 border-blue-100 shadow-sm"> <leader.icon className="h-8 w-8" /> </div>} </div> <h4 className="text-lg font-bold text-gray-900">{leader.name}</h4> <span className="inline-block bg-blue-50 text-blue-700 text-xs font-bold px-2 py-1 rounded mt-1 mb-2 uppercase tracking-wide border border-blue-100"> {leader.role} </span> <p className="text-gray-600 text-sm leading-snug">{leader.affiliation}</p> </div>)} </div> </motion.div> </div> </div> </div>;
};
export default Hero;