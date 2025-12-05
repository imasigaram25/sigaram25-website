import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const ArtworkCard = ({ art }) => (
    <motion.div
        layout
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.3 }}
        className="group relative"
    >
        <Link to={`/sigaram/artwork/${art.id}`}>
            <img src={art.image_url} alt={art.title} className="w-full h-72 object-cover rounded-lg shadow-md" />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex flex-col justify-end p-4 rounded-lg">
                <h3 className="text-white font-bold text-xl opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">{art.title}</h3>
                <p className="text-gray-300 text-sm opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-100">by {art.participant.full_name}</p>
            </div>
        </Link>
    </motion.div>
);


const ArtworkGallery = () => {
    const [artworks, setArtworks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchArtworks = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('sigaram_fine_arts_artworks')
                .select('id, title, image_url, participant:sigaram_participants(full_name)')
                .eq('status', 'approved')
                .order('submitted_at', { ascending: false });
            
            if (!error) {
                setArtworks(data);
            }
            setLoading(false);
        };
        fetchArtworks();
    }, []);

    if (loading) return <div className="flex justify-center items-center h-screen"><Loader2 className="h-12 w-12 animate-spin text-blue-600"/></div>;

    return (
        <div className="container mx-auto px-4 py-12 pt-28">
            <h1 className="text-4xl font-extrabold text-center mb-12">Artwork Gallery</h1>
            
            {artworks.length === 0 ? (
                <p className="text-center text-gray-500">No approved artworks to display yet. Check back soon!</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {artworks.map(art => <ArtworkCard key={art.id} art={art} />)}
                </div>
            )}
        </div>
    );
};

export default ArtworkGallery;