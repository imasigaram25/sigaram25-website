import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/lib/customSupabaseClient';
import { Loader2, UserCircle } from 'lucide-react';

const ParticipantPortfolio = () => {
    const { id } = useParams();
    const [participant, setParticipant] = useState(null);
    const [artworks, setArtworks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPortfolio = async () => {
            const { data: pData, error: pError } = await supabase.from('sigaram_participants').select('*').eq('id', id).single();
            const { data: aData, error: aError } = await supabase
                .from('sigaram_fine_arts_artworks')
                .select('id, title, image_url, event:sigaram_events(name)')
                .eq('participant_id', id)
                .eq('status', 'approved');
            
            if (pError || aError) {
                console.error(pError || aError);
            } else {
                setParticipant(pData);
                setArtworks(aData);
            }
            setLoading(false);
        };
        fetchPortfolio();
    }, [id]);

    if (loading) return <div className="flex justify-center items-center h-screen"><Loader2 className="h-12 w-12 animate-spin text-blue-600"/></div>;
    if (!participant) return <div className="text-center py-16">Participant not found.</div>;

    return (
        <div className="container mx-auto px-4 py-12 pt-28">
            <header className="text-center mb-12">
                <UserCircle className="h-24 w-24 mx-auto text-gray-300 mb-4"/>
                <h1 className="text-4xl font-bold">{participant.full_name}</h1>
                <p className="text-lg text-gray-500">{participant.ima_branch}</p>
            </header>

            <main>
                <h2 className="text-2xl font-bold mb-6">Submitted Artworks</h2>
                {artworks.length === 0 ? (
                    <p className="text-center text-gray-500">This participant has no approved artworks yet.</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {artworks.map(art => (
                             <div key={art.id} className="group relative border rounded-lg overflow-hidden shadow-sm">
                                <Link to={`/sigaram/artwork/${art.id}`}>
                                    <img src={art.image_url} alt={art.title} className="w-full h-72 object-cover" />
                                     <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex flex-col justify-end p-4">
                                        <h3 className="text-white font-bold text-xl opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">{art.title}</h3>
                                        <p className="text-gray-300 text-sm opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-100">{art.event.name}</p>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default ParticipantPortfolio;