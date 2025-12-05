
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Calendar, MapPin, Clock, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const EventScheduleList = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            const { data } = await supabase
                .from('sigaram_events')
                .select('id, name, event_time, location, created_at') // Using created_at as proxy for date if not available, or static
                .order('name');
            setEvents(data || []);
            setLoading(false);
        };
        fetchEvents();
    }, []);

    if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-blue-500"/></div>;

    return (
        <section className="py-12 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold text-gray-900">Event Schedule & Venues</h2>
                    <p className="text-gray-500 mt-2">Quick reference for all Sigaram 2025 events</p>
                </div>
                
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {events.map(event => (
                        <Card key={event.id} className="hover:shadow-md transition-shadow border-l-4 border-l-blue-500">
                            <CardContent className="p-5">
                                <h3 className="font-bold text-lg text-gray-900 mb-3">{event.name}</h3>
                                <div className="space-y-2 text-sm text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-blue-500"/> 
                                        <span>{event.event_time || 'Time TBA'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-red-500"/> 
                                        <span>{event.location || 'Venue TBA'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-green-500"/> 
                                        <span>December 7, 2025</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default EventScheduleList;
