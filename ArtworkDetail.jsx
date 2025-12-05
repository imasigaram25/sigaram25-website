import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send, UserCircle } from 'lucide-react';

const ArtworkDetail = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const { toast } = useToast();

    const [artwork, setArtwork] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [commenting, setCommenting] = useState(false);

    const fetchData = useCallback(async () => {
        const { data: artData, error: artError } = await supabase
            .from('sigaram_fine_arts_artworks')
            .select('*, participant:sigaram_participants(id, full_name), event:sigaram_events(name)')
            .eq('id', id)
            .single();
        
        const { data: comData, error: comError } = await supabase
            .from('sigaram_fine_arts_comments')
            .select('*, participant:sigaram_participants(full_name)')
            .eq('artwork_id', id)
            .order('created_at', { ascending: false });

        if (artError || comError) {
            console.error(artError || comError);
        } else {
            setArtwork(artData);
            setComments(comData);
        }
        setLoading(false);
    }, [id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handlePostComment = async () => {
        if (!newComment.trim()) return;
        if (!user) {
            toast({ title: "Please log in", description: "You must be logged in to comment.", variant: "destructive" });
            return;
        }
        setCommenting(true);
        const { error } = await supabase.from('sigaram_fine_arts_comments').insert({
            artwork_id: id,
            participant_id: user.id,
            comment_text: newComment,
        });

        if (error) {
            toast({ title: "Error", description: "Failed to post comment.", variant: "destructive" });
        } else {
            setNewComment('');
            fetchData(); // Refresh comments
        }
        setCommenting(false);
    };

    if (loading) return <div className="flex justify-center items-center h-screen"><Loader2 className="h-12 w-12 animate-spin text-blue-600"/></div>;
    if (!artwork) return <div className="text-center py-16">Artwork not found.</div>;

    return (
        <div className="container mx-auto px-4 py-12 pt-28 max-w-5xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                    <img src={artwork.image_url} alt={artwork.title} className="w-full rounded-lg shadow-xl" />
                </div>
                <div>
                    <h1 className="text-4xl font-bold mb-2">{artwork.title}</h1>
                    <div className="text-lg text-gray-700 mb-4">
                        by <Link to={`/sigaram/participant/${artwork.participant.id}`} className="font-semibold text-blue-600 hover:underline">{artwork.participant.full_name}</Link>
                    </div>
                    <p className="text-md text-gray-500 mb-4">Event: {artwork.event.name}</p>
                    {artwork.description && <p className="text-gray-600 whitespace-pre-wrap">{artwork.description}</p>}
                </div>
            </div>

            <div className="mt-12">
                <h2 className="text-2xl font-bold mb-4">Comments ({comments.length})</h2>
                <div className="space-y-4">
                    {user && (
                        <div className="flex items-start space-x-4">
                            <UserCircle className="h-10 w-10 text-gray-400"/>
                            <div className="flex-1">
                                <Textarea value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Add a public comment..." />
                                <Button onClick={handlePostComment} disabled={commenting} className="mt-2">
                                    {commenting ? <Loader2 className="h-4 w-4 mr-2 animate-spin"/> : <Send className="h-4 w-4 mr-2"/>} Post
                                </Button>
                            </div>
                        </div>
                    )}
                     {!user && (
                        <div className="text-center p-4 border rounded-lg bg-gray-50">
                            <p><Link to="/sigaram/participant-login" className="font-semibold text-blue-600">Log in</Link> to post a comment.</p>
                        </div>
                    )}
                    {comments.map(comment => (
                        <div key={comment.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                            <UserCircle className="h-8 w-8 text-gray-400 mt-1"/>
                            <div className="flex-1">
                                <p className="font-semibold">{comment.participant.full_name} <span className="text-xs text-gray-500 font-normal ml-2">{new Date(comment.created_at).toLocaleString()}</span></p>
                                <p className="text-gray-700">{comment.comment_text}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ArtworkDetail;