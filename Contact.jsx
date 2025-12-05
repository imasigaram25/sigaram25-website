import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, Send, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
const Contact = () => {
  const {
    toast
  } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const contactInfo = [{
    icon: MapPin,
    title: 'Address',
    details: 'Kumudepalli, Hosur - 635109\nTamil Nadu, India',
    color: 'from-blue-500 to-blue-600'
  }, {
    icon: Phone,
    title: 'Phone',
    details: '+91 94433 41102',
    color: 'from-green-500 to-green-600'
  }, {
    icon: Mail,
    title: 'Email',
    details: 'info@imahosur.com',
    color: 'from-purple-500 to-purple-600'
  }, {
    icon: Clock,
    title: 'Office Hours',
    details: 'Monday - Friday: 9:00 AM - 5:00 PM\nSaturday: 9:00 AM - 1:00 PM',
    color: 'from-orange-500 to-orange-600'
  }];
  const handleSubmit = async e => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitSuccess(false);
    try {
      // 1. Save to Supabase Database
      const {
        error: dbError
      } = await supabase.from('contact_messages').insert([{
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        subject: formData.subject,
        message: formData.message
      }]);
      if (dbError) throw dbError;

      // 2. Trigger Edge Function to send email
      try {
        const {
          error: funcError
        } = await supabase.functions.invoke('send-contact-email', {
          body: formData
        });
        if (funcError) {
          console.warn('Email function warning:', funcError);
        }
      } catch (emailError) {
        console.warn('Email notification could not be sent (Network/Function error):', emailError);
      }

      // Success State
      setSubmitSuccess(true);
      toast({
        title: "Message Sent Successfully!",
        description: "Thank you for contacting us. We will get back to you shortly.",
        variant: "default",
        className: "bg-green-50 border-green-200"
      });

      // Reset form after delay
      setTimeout(() => {
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: ''
        });
        setSubmitSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error submitting form:', error);
      let errorMessage = "There was a problem sending your message. Please try again later.";
      if (error.message && error.message.includes("Failed to fetch")) {
        errorMessage = "Connection error. Please check your internet connection and try again.";
      }
      toast({
        title: "Submission Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleChange = e => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  return <section id="contact" className="py-20 bg-white">
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
            Contact Us
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Get in touch with us for membership inquiries, event information, or any other questions.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          <motion.div initial={{
          opacity: 0,
          x: -20
        }} whileInView={{
          opacity: 1,
          x: 0
        }} viewport={{
          once: true
        }} transition={{
          duration: 0.6
        }}>
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 relative overflow-hidden">
              {submitSuccess && <motion.div initial={{
              opacity: 0,
              scale: 0.9
            }} animate={{
              opacity: 1,
              scale: 1
            }} className="absolute inset-0 bg-white/95 backdrop-blur-sm z-10 flex flex-col items-center justify-center text-center p-6">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 className="h-10 w-10 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Message Sent!</h3>
                  <p className="text-gray-600">Thanks for reaching out. We'll be in touch soon.</p>
                </motion.div>}

              <h3 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} disabled={isSubmitting} required className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-50 disabled:text-gray-500" placeholder="Dr. John Doe" />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} disabled={isSubmitting} required className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-50 disabled:text-gray-500" placeholder="john@example.com" />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} disabled={isSubmitting} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-50 disabled:text-gray-500" placeholder="+91 98765 43210" />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">
                    Subject *
                  </label>
                  <input type="text" id="subject" name="subject" value={formData.subject} onChange={handleChange} disabled={isSubmitting} required className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-50 disabled:text-gray-500" placeholder="Membership Inquiry" />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea id="message" name="message" value={formData.message} onChange={handleChange} disabled={isSubmitting} required rows="5" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none disabled:bg-gray-50 disabled:text-gray-500" placeholder="Please provide details about your inquiry..."></textarea>
                </div>

                <Button type="submit" size="lg" disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-700 text-white group">
                  {isSubmitting ? <>
                      Sending Message...
                      <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                    </> : <>
                      Send Message
                      <Send className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </>}
                </Button>
              </form>
            </div>
          </motion.div>

          <motion.div initial={{
          opacity: 0,
          x: 20
        }} whileInView={{
          opacity: 1,
          x: 0
        }} viewport={{
          once: true
        }} transition={{
          duration: 0.6
        }} className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h3>
            
            {contactInfo.map((info, index) => <motion.div key={index} initial={{
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
          }} className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 hover:shadow-lg transition-shadow duration-300 group">
                <div className="flex items-start">
                  <div className={`w-12 h-12 bg-gradient-to-br ${info.color} rounded-lg flex items-center justify-center mr-4 flex-shrink-0 shadow-md group-hover:scale-110 transition-transform`}>
                    <info.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 mb-2">{info.title}</h4>
                    <p className="text-gray-600 whitespace-pre-line leading-relaxed">{info.details}</p>
                  </div>
                </div>
              </motion.div>)}

            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl p-6 text-white mt-8 shadow-xl">
              <h4 className="text-xl font-bold mb-3">Visit Our Office</h4>
              <p className="text-blue-100 mb-4">We welcome you to visit our office during working hours with prior appointment</p>
              <div className="aspect-video rounded-lg overflow-hidden shadow-inner border border-white/20">
                <img alt="IMA Hosur office location map" className="w-full h-full object-cover" src="https://horizons-cdn.hostinger.com/e1d70592-6c37-4029-a5fd-237ef806c0cd/ima-hall-welcome-jHFLH.jpeg" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>;
};
export default Contact;