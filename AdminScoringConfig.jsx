
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Save, Settings, RotateCcw } from 'lucide-react';

const AdminScoringConfig = () => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [configs, setConfigs] = useState([]);

    const defaultConfigs = [
        { event_type: 'Solo', rank_1_score: 10, rank_2_score: 7, rank_3_score: 5 },
        { event_type: 'Group', rank_1_score: 20, rank_2_score: 15, rank_3_score: 10 },
        { event_type: 'Cultural', rank_1_score: 30, rank_2_score: 25, rank_3_score: 15 },
        { event_type: 'Mega', rank_1_score: 40, rank_2_score: 25, rank_3_score: 15 },
    ];

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('scoring_config')
                .select('*')
                .order('event_type');
            
            if (error) throw error;
            
            // Merge with defaults if DB is empty or missing types
            if (!data || data.length === 0) {
                setConfigs(defaultConfigs);
                // Auto-seed DB for first time
                await supabase.from('scoring_config').upsert(defaultConfigs, { onConflict: 'event_type' });
            } else {
                setConfigs(data);
            }
        } catch (err) {
            console.error(err);
            toast({ title: "Error", description: "Failed to load configuration.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (index, field, value) => {
        const newConfigs = [...configs];
        newConfigs[index][field] = parseInt(value) || 0;
        setConfigs(newConfigs);
    };

    const handleSave = async (config) => {
        setSaving(true);
        try {
            const { error } = await supabase
                .from('scoring_config')
                .upsert({
                    event_type: config.event_type,
                    rank_1_score: config.rank_1_score,
                    rank_2_score: config.rank_2_score,
                    rank_3_score: config.rank_3_score,
                    updated_at: new Date()
                }, { onConflict: 'event_type' });

            if (error) throw error;
            toast({ title: "Saved", description: `${config.event_type} scoring updated.` });
        } catch (err) {
            console.error(err);
            toast({ title: "Error", description: err.message, variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    const handleReset = async () => {
        if (!window.confirm("Reset all scoring to system defaults?")) return;
        setSaving(true);
        try {
            const { error } = await supabase
                .from('scoring_config')
                .upsert(defaultConfigs, { onConflict: 'event_type' });
            
            if (error) throw error;
            setConfigs(defaultConfigs);
            toast({ title: "Reset Complete", description: "All scores reset to default." });
        } catch (err) {
             toast({ title: "Error", description: err.message, variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-12 text-center"><Loader2 className="animate-spin mx-auto"/></div>;

    return (
        <div className="space-y-6 p-6 bg-white rounded-xl shadow-sm border">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Settings className="w-6 h-6 text-gray-600"/> Scoring Configuration
                    </h2>
                    <p className="text-gray-500">Define points awarded for each rank by event type.</p>
                </div>
                <Button variant="outline" onClick={handleReset} className="text-red-600 border-red-100 hover:bg-red-50">
                    <RotateCcw className="w-4 h-4 mr-2"/> Reset Defaults
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
                {configs.map((config, idx) => (
                    <div key={config.event_type} className="bg-gray-50 p-5 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-black text-lg text-gray-800 uppercase tracking-wider">{config.event_type} Events</h3>
                            <span className="text-xs text-gray-400 bg-white px-2 py-1 rounded border">Auto-Saved</span>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 mb-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-yellow-600 uppercase">1st Place</label>
                                <Input 
                                    type="number" 
                                    value={config.rank_1_score} 
                                    onChange={(e) => handleChange(idx, 'rank_1_score', e.target.value)}
                                    className="font-mono font-bold text-lg border-yellow-200 focus:ring-yellow-500"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">2nd Place</label>
                                <Input 
                                    type="number" 
                                    value={config.rank_2_score} 
                                    onChange={(e) => handleChange(idx, 'rank_2_score', e.target.value)}
                                    className="font-mono font-bold text-lg"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-orange-600 uppercase">3rd Place</label>
                                <Input 
                                    type="number" 
                                    value={config.rank_3_score} 
                                    onChange={(e) => handleChange(idx, 'rank_3_score', e.target.value)}
                                    className="font-mono font-bold text-lg border-orange-200 focus:ring-orange-500"
                                />
                            </div>
                        </div>

                        <Button 
                            className="w-full bg-blue-600 hover:bg-blue-700" 
                            onClick={() => handleSave(config)}
                            disabled={saving}
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin"/> : <Save className="w-4 h-4 mr-2"/>}
                            Save Configuration
                        </Button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminScoringConfig;
