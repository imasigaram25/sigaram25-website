import React, { useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { AlertTriangle, Trash2, Loader2, Database } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const DataManagement = () => {
  const { toast } = useToast();
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [loading, setLoading] = useState(false);

  const handleNuke = async () => {
      if (deleteConfirmation !== "DELETE ALL DATA") return;
      
      setLoading(true);
      try {
          // ORDER MATTERS FOR FOREIGN KEYS
          
          // 1. Child tables (Scores, attendance, etc)
          await supabase.from('sigaram_scores').delete().neq('id', '00000000-0000-0000-0000-000000000000');
          await supabase.from('sigaram_attendance').delete().neq('id', '00000000-0000-0000-0000-000000000000');
          
          // 2. Team members
          await supabase.from('sigaram_team_members').delete().neq('id', '00000000-0000-0000-0000-000000000000');
          
          // 3. Teams
          await supabase.from('sigaram_teams').delete().neq('id', '00000000-0000-0000-0000-000000000000');
          
          // 4. Event mappings (Organizers, Judges) - Delete LINKS, not necessarily profiles
          await supabase.from('sigaram_event_organizers').delete().neq('id', '00000000-0000-0000-0000-000000000000');
          await supabase.from('sigaram_event_judges').delete().neq('id', '00000000-0000-0000-0000-000000000000');

          // 5. Participants (The main linking entity)
          await supabase.from('sigaram_event_participants').delete().neq('id', '00000000-0000-0000-0000-000000000000');
          
          // 6. Finally, Events themselves
          await supabase.from('sigaram_events').delete().neq('id', '00000000-0000-0000-0000-000000000000');
          
          toast({
              title: "SYSTEM DATA CLEARED",
              description: "All event-related data has been wiped successfully.",
              className: "bg-red-100 border-red-300 text-red-900 font-bold"
          });
          
          setDeleteConfirmation('');

      } catch (err) {
          toast({ title: "Deletion Failed", description: err.message, variant: "destructive" });
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
            <div className="bg-red-50 border border-red-200 rounded-xl p-8">
                <div className="flex items-start gap-4 mb-6">
                    <div className="bg-red-100 p-3 rounded-full">
                        <AlertTriangle className="w-8 h-8 text-red-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-red-900">Danger Zone</h2>
                        <p className="text-red-700 text-sm mt-1">Irreversible actions for system reset.</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <p className="text-sm text-gray-700 font-medium">
                        To perform a full system reset (delete all events, participants, teams, and scores), type <strong className="font-mono bg-gray-100 px-1">DELETE ALL DATA</strong> below.
                    </p>
                    
                    <Input 
                        value={deleteConfirmation}
                        onChange={e => setDeleteConfirmation(e.target.value)}
                        placeholder="Type DELETE ALL DATA"
                        className="border-red-300 focus:ring-red-500"
                    />

                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button 
                                variant="destructive" 
                                className="w-full" 
                                disabled={deleteConfirmation !== "DELETE ALL DATA" || loading}
                            >
                                {loading ? <Loader2 className="animate-spin mr-2" /> : <Trash2 className="mr-2 h-4 w-4" />}
                                Permanent System Reset
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete all events, participants, scores, and team data from the database.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleNuke} className="bg-red-600">
                                    Yes, Delete Everything
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>
        </div>

        <div className="bg-white p-6 rounded-xl border shadow-sm">
            <div className="flex items-center gap-3 mb-6">
                <Database className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">Data status</h2>
            </div>
            <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded border flex justify-between items-center">
                    <span className="text-gray-600">Database Connection</span>
                    <span className="text-green-600 font-bold text-sm flex items-center gap-1"><span className="w-2 h-2 bg-green-500 rounded-full"></span> Active</span>
                </div>
                <div className="p-4 bg-gray-50 rounded border flex justify-between items-center">
                    <span className="text-gray-600">Last Backup</span>
                    <span className="text-gray-400 text-sm">Automatic (Daily)</span>
                </div>
            </div>
        </div>
    </div>
  );
};

export default DataManagement;