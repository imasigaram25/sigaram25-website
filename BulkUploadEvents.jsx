import React, { useState, useRef } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Upload, FileSpreadsheet, AlertCircle, CheckCircle2, FileText, X } from 'lucide-react';
import Papa from 'papaparse';

const BulkUploadEvents = ({ onUploadComplete }) => {
    const { toast } = useToast();
    const fileInputRef = useRef(null);
    
    const [selectedFile, setSelectedFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [statusMessage, setStatusMessage] = useState(null); 

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setStatusMessage(null); 
        if (file) {
            if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
                setStatusMessage({ type: 'error', text: 'Invalid file. Please select a .csv file.' });
                setSelectedFile(null);
                return;
            }
            setSelectedFile(file);
        }
    };

    const triggerFileInput = () => {
        if (fileInputRef.current) {
            fileInputRef.current.value = ''; 
            fileInputRef.current.click();
        }
    };

    const clearFile = () => {
        setSelectedFile(null);
        setStatusMessage(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // Helper to normalize headers to lower case and trim
    const normalizeHeader = (header) => {
        return header.toLowerCase().trim().replace(/[\s_]+/g, '');
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        setIsUploading(true);
        setStatusMessage(null);

        Papa.parse(selectedFile, {
            header: true,
            skipEmptyLines: true,
            transformHeader: normalizeHeader, // Normalize headers automatically
            complete: async (results) => {
                if (results.errors.length > 0) {
                    console.error("CSV Errors:", results.errors);
                    setIsUploading(false);
                    setStatusMessage({ type: 'error', text: 'Error parsing CSV file.' });
                    return;
                }

                if (results.data.length === 0) {
                    setIsUploading(false);
                    setStatusMessage({ type: 'error', text: 'File is empty.' });
                    return;
                }

                // Flexible column mapping
                // Expected normalized keys: eventname, starttime (required)
                // Optional: location, endtime, description, category
                
                let successCount = 0;
                let failCount = 0;
                const failReasons = [];

                for (const row of results.data) {
                    // Try to find the name field
                    const name = row['eventname'] || row['event'] || row['name'];
                    // Try to find time field
                    const startTime = row['starttime'] || row['start'] || row['time'] || row['eventtime'];
                    
                    if (!name || !startTime) {
                        failCount++;
                        continue;
                    }

                    const payload = {
                        name: name.trim(),
                        location: row['location'] || row['venue'] || 'Main Hall',
                        event_time: startTime.trim(),
                        description: row['description'] || row['desc'] || '',
                        revised_time: row['endtime'] || row['revisedtime'] || null,
                        category: row['category'] || 'General',
                        is_fine_arts_event: true
                    };

                    const { error } = await supabase.from('sigaram_events').insert(payload);
                    if (error) {
                        console.error("Insert error:", error);
                        failCount++;
                        failReasons.push(`${name}: ${error.message}`);
                    } else {
                        successCount++;
                    }
                }

                setIsUploading(false);
                setStatusMessage({ 
                    type: successCount > 0 ? 'success' : 'error', 
                    text: `Success: ${successCount}, Failed: ${failCount}` 
                });
                
                if (failReasons.length > 0) {
                    console.warn("Failed Rows:", failReasons);
                }

                if (successCount > 0) {
                    toast({
                        title: "Upload Complete",
                        description: `Added ${successCount} events.`,
                    });
                    setSelectedFile(null); 
                    if (onUploadComplete) onUploadComplete();
                } else {
                    toast({
                        title: "Upload Failed",
                        description: "Check console for details.",
                        variant: "destructive"
                    });
                }
            },
            error: (err) => {
                console.error("PapaParse error:", err);
                setIsUploading(false);
                setStatusMessage({ type: 'error', text: 'Failed to read file.' });
            }
        });
    };

    return (
        <div className="bg-white p-6 rounded-lg border shadow-sm mt-6">
            <div className="flex items-center gap-2 mb-4">
                <div className="bg-green-100 p-2 rounded-full">
                    <FileSpreadsheet className="w-5 h-5 text-green-600"/>
                </div>
                <h3 className="font-bold text-gray-800">Bulk Upload Events</h3>
            </div>

            <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center bg-gray-50 space-y-6">
                <input 
                    type="file" 
                    accept=".csv" 
                    className="hidden" 
                    ref={fileInputRef} 
                    onChange={handleFileChange}
                />

                {!selectedFile ? (
                    <div className="space-y-3">
                        <Upload className="w-12 h-12 text-gray-300 mx-auto"/>
                        <p className="text-gray-500 font-medium">Select CSV file</p>
                        <p className="text-xs text-gray-400">Required: Event Name, Start Time</p>
                        <Button type="button" variant="outline" onClick={triggerFileInput}>Select File</Button>
                    </div>
                ) : (
                    <div className="flex items-center justify-center gap-3 bg-white p-3 rounded-lg border shadow-sm max-w-md mx-auto">
                        <FileText className="w-8 h-8 text-blue-500"/>
                        <div className="text-left flex-1">
                            <p className="font-bold text-gray-800 truncate max-w-[200px]">{selectedFile.name}</p>
                        </div>
                        {!isUploading && (
                            <Button variant="ghost" size="sm" onClick={clearFile}><X className="w-4 h-4"/></Button>
                        )}
                    </div>
                )}

                {statusMessage && (
                    <div className={`p-3 rounded-lg flex items-center justify-center gap-2 text-sm font-medium ${statusMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {statusMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4"/> : <AlertCircle className="w-4 h-4"/>}
                        {statusMessage.text}
                    </div>
                )}

                <div className="pt-2">
                    <Button 
                        onClick={handleUpload}
                        disabled={!selectedFile || isUploading} 
                        className="w-full max-w-md bg-blue-600 hover:bg-blue-700"
                    >
                        {isUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <Upload className="w-4 h-4 mr-2"/>}
                        {isUploading ? 'Uploading...' : 'Upload Events'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default BulkUploadEvents;