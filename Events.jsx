
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Clock, Users, ArrowRight, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import EventScheduleList from './EventScheduleList';

const Events = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const upcomingEvents = [
    {
      title: 'SIGARAM 2025 - Champion of Champions',
      date: 'December 7, 2025',
      time: '9:00 AM Onwards',
      location: 'Meera Mahal, Hosur',
      attendees: 'IMA TNSB Fine Arts Finals',
      description: 'The grand finale of artistic expression. Join us for the IMA TNSB Fine Arts Finals, a prestigious gathering celebrating artistic excellence within the medical community.',
      imageUrl: 'https://horizons-cdn.hostinger.com/e1d70592-6c37-4029-a5fd-237ef806c0cd/0c68d5d84547bba86933cc964570ab97.jpg',
      isFeatured: true,
      isSigaram: true,
      registrationLink: null, 
    }
  ];

  const pastEvents = [
    {
      title: 'AADUKALAM 2025',
      date: 'November 29 - 30, 2025',
      time: 'Full Day Event',
      location: 'Hosur',
      attendees: 'IMA Tamil Nadu State Branch Sports Finals',
      description: 'Unite. Compete. Inspire. Join us for the IMA TAMILNADU STATE BRANCH sports event, proudly hosted by IMA Hosur. A celebration of sportsmanship and camaraderie among medical professionals.',
      imageUrl: 'https://horizons-cdn.hostinger.com/e1d70592-6c37-4029-a5fd-237ef806c0cd/4b23f6e7d5bab52928d60ef7a3ec8f8f.jpg',
      participants: '300+ Participants',
    },
    {
      title: 'CME Programme - SPARSH Hospital in Association with IMA Hosur',
      date: 'November 25, 2025',
      time: '08:00 PM Onwards',
      location: 'IMA Hall Hosur',
      attendees: 'Medical Professionals',
      description: 'SPARSH Hospital, Sarjapur Road cordially invites you to a CME Programme in Association with IMA Hosur. This session includes valuable insights from leading experts.',
      imageUrl: 'https://horizons-cdn.hostinger.com/e1d70592-6c37-4029-a5fd-237ef806c0cd/5dc6a4da9e4bf4ca980ed722fe227298.jpg',
      participants: '150+ Participants',
    }
  ];

  const handleRegister = (link) => {
    if (link) {
      window.open(link, '_blank');
    } else {
      toast({
        title: "🚧 Registration Closed",
        description: "Registration for this event is currently closed or handled through the dashboard.",
      });
    }
  };

  const handleDashboardNavigation = () => {
      navigate('/sigaram');
  };

  return (
    <section id="events" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Events & Activities
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Stay updated with our upcoming events, conferences, and community health initiatives.
          </p>
        </motion.div>

        <div className="mb-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
             <Calendar className="h-6 w-6 text-blue-600"/> Upcoming Events
          </h3>
          {upcomingEvents.length === 0 ? (
            <p className="text-center text-gray-500 text-lg">No upcoming events at the moment. Please check back soon!</p>
          ) : (
            <div className="grid grid-cols-1 gap-8">
              {upcomingEvents.map((event, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className={`bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 border ${event.isFeatured ? 'border-blue-200 ring-2 ring-blue-100' : 'border-gray-100'}`}
                >
                  <div className="grid lg:grid-cols-5">
                    {/* Image Section */}
                    <div className="lg:col-span-2 p-4 bg-gray-50 flex flex-col justify-start items-center">
                      <div className="w-full rounded-lg overflow-hidden shadow-md border-4 border-double border-blue-200 bg-white p-1 relative">
                        <img 
                          alt={event.title} 
                          className="w-full h-auto object-contain block" 
                          src={event.imageUrl} 
                        />
                        <div className={`absolute top-2 right-2 ${event.isFeatured ? 'bg-yellow-500' : 'bg-blue-600'} text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg z-10`}>
                          {event.isFeatured ? 'Featured' : 'Upcoming'}
                        </div>
                      </div>
                      <div className="mt-4 lg:hidden text-center">
                        <h4 className="text-xl font-bold text-gray-900">{event.title}</h4>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="lg:col-span-3 p-6 lg:p-8">
                      <div className="hidden lg:block mb-4">
                        <h4 className="text-2xl font-bold text-gray-900">{event.title}</h4>
                        <p className="text-blue-600 font-medium">{event.attendees}</p>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4 mb-6">
                        <div className="flex items-center text-gray-600">
                          <Calendar className="h-5 w-5 mr-3 text-blue-600 flex-shrink-0" />
                          <span className="font-medium">{event.date}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Clock className="h-5 w-5 mr-3 text-blue-600 flex-shrink-0" />
                          <span className="font-medium">{event.time}</span>
                        </div>
                        <div className="flex items-center text-gray-600 sm:col-span-2">
                          <MapPin className="h-5 w-5 mr-3 text-blue-600 flex-shrink-0" />
                          <span className="font-medium">{event.location}</span>
                        </div>
                      </div>

                      <p className="text-gray-700 leading-relaxed mb-6">
                        {event.description}
                      </p>

                      {event.isSigaram ? (
                          <Button 
                            onClick={handleDashboardNavigation}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white group text-lg py-6 shadow-lg"
                          >
                             <LayoutDashboard className="mr-2 h-5 w-5" />
                            Go to SIGARAM Dashboard
                            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                          </Button>
                      ) : (
                          <Button 
                            onClick={() => handleRegister(event.registrationLink)}
                            className={`w-full ${event.isFeatured ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-blue-600 hover:bg-blue-700'} text-white group text-lg py-6 shadow-lg animate-pulse hover:animate-none`}
                          >
                            Register Now
                            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                          </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* New Event Schedule Section */}
        <EventScheduleList />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-gray-50 rounded-2xl p-8 border border-gray-200 mt-16"
        >
          <h3 className="text-2xl font-bold text-gray-700 mb-6 flex items-center gap-2">
             <Clock className="h-6 w-6 text-gray-500"/> Past Events
          </h3>
          {pastEvents.length === 0 ? (
            <p className="text-center text-gray-500 text-lg">No past events to display.</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pastEvents.map((event, index) => (
                <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow opacity-100">
                   <div className="relative h-40 mb-4 rounded-lg overflow-hidden bg-gray-100 group">
                      <img 
                        src={event.imageUrl} 
                        alt={event.title} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                      />
                      <div className="absolute top-2 right-2 bg-gray-600/90 text-white text-xs font-bold px-2 py-1 rounded backdrop-blur-sm">Completed</div>
                   </div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-1" />
                        {event.date}
                    </div>
                  </div>
                  <h4 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2 h-14">{event.title}</h4>
                  <p className="text-sm text-gray-500 mb-4 line-clamp-3">{event.description}</p>
                  <div className="flex items-center text-sm text-gray-600 font-semibold bg-gray-100 px-3 py-2 rounded-lg w-fit">
                    <Users className="h-4 w-4 mr-2 text-gray-500" />
                    {event.participants || 'Event Completed'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default Events;
