import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Upload, FileSpreadsheet, AlertTriangle, CheckCircle } from 'lucide-react';
import { parseCSV } from '@/lib/csvUtils';

const BulkUploadParticipants = () => {
    const { toast } = useToast();
    const fileInputRef = useRef(null);
    
    const [file, setFile] = useState(null);
    const [previewData, setPreviewData] = useState([]);
    const [validEventsMap, setValidEventsMap] = useState({}); 
    const [uploading, setUploading] = useState(false);
    const [validationErrors, setValidationErrors] = useState([]);
    const [uploadResult, setUploadResult] = useState(null);
    const [activeStep, setActiveStep] = useState('upload');

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        const { data } = await supabase.from('sigaram_events').select('id, name');
        if (data) {
            const mapping = {};
            data.forEach(e => {
                // Normalize DB event names: lowercase + trim
                mapping[e.name.trim().toLowerCase()] = e.id;
            });
            console.log("Available Events (Normalized):", Object.keys(mapping));
            setValidEventsMap(mapping);
        }
    };

    const handleBrowseClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            parseFile(selectedFile);
        }
    };

    // Helper to find a column value case-insensitively
    const getValue = (row, keys) => {
        const rowKeys = Object.keys(row);
        for (const key of keys) {
            const foundKey = rowKeys.find(k => k.toLowerCase().trim() === key.toLowerCase());
            if (foundKey) return row[foundKey];
        }
        return null;
    };

    const parseFile = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target.result;
            try {
                const data = parseCSV(text);
                if (data && data.length > 0) {
                    setPreviewData(data);
                    validateData(data);
                    setActiveStep('preview');
                } else {
                    toast({ title: "Empty File", description: "The CSV file appears to be empty.", variant: "destructive" });
                }
            } catch (err) {
                console.error(err);
                toast({ title: "Error parsing file", description: "Invalid CSV format", variant: "destructive" });
            }
        };
        reader.readAsText(file);
    };

    const validateData = (data) => {
        const errors = [];
        data.forEach((row, idx) => {
            const rowNum = idx + 1;
            
            const pName = getValue(row, ['Participant Name', 'Name', 'Participant']);
            const eName = getValue(row, ['Event Name', 'Event', 'Competition']);
            
            const missingFields = [];
            if (!pName) missingFields.push('Participant Name');
            if (!eName) missingFields.push('Event Name');
            
            if (missingFields.length > 0) {
                errors.push(`Row ${rowNum}: Missing ${missingFields.join(', ')}`);
            } else {
                // Fuzzy match event name
                const normalizedEventName = eName.trim().toLowerCase();
                if (!validEventsMap[normalizedEventName]) {
                    errors.push(`Row ${rowNum}: Event '${eName}' not found in database. Check spelling.`);
                }
            }
        });
        setValidationErrors(errors);
    };

    const handleUpload = async () => {
        if (!previewData || previewData.length === 0) {
            toast({ title: "No Data", description: "Please select a valid CSV file first.", variant: "destructive" });
            return;
        }

        setUploading(true);
        setActiveStep('processing');

        try {
            // Prepare rows
            const rowsToInsert = previewData.map(row => {
                const eName = getValue(row, ['Event Name', 'Event', 'Competition']);
                if (!eName) return null;

                const eventId = validEventsMap[eName.trim().toLowerCase()];
                if (!eventId) return null;

                const pName = getValue(row, ['Participant Name', 'Name', 'Participant']);
                const branch = getValue(row, ['Branch', 'IMA Branch', 'Zone']);
                const team = getValue(row, ['Team Name', 'Team']);
                const mobile = getValue(row, ['Contact Number', 'Mobile', 'Phone']);
                const type = getValue(row, ['Participant Type', 'Type']);

                return {
                    event_id: eventId,
                    name: pName,
                    ima_branch: branch || 'Unknown',
                    team_name: team || pName,
                    mobile: mobile || null,
                    participant_type: type || 'Individual',
                    details: {
                         uploaded_via: 'bulk_csv',
                         original_event_name: eName,
                         uploaded_at: new Date().toISOString()
                    }
                };
            }).filter(r => r !== null);

            if (rowsToInsert.length === 0) {
                throw new Error("No valid rows found. Please check Event Names match database.");
            }

            const { error } = await supabase
                .from('sigaram_event_participants')
                .insert(rowsToInsert);

            if (error) throw error;

            setUploadResult({ success: rowsToInsert.length });
            setActiveStep('result');
            toast({ title: "Upload Complete", description: `Added ${rowsToInsert.length} participants.` });

        } catch (err) {
            console.error(err);
            toast({ title: "Upload Failed", description: err.message, variant: "destructive" });
            setActiveStep('preview'); 
        } finally {
            setUploading(false);
        }
    };

    const reset = () => {
        setFile(null);
        setPreviewData([]);
        setValidationErrors([]);
        setUploadResult(null);
        setActiveStep('upload');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="space-y-6 p-6 bg-white rounded-xl border shadow-sm">
            <div className="flex justify-between items-center border-b pb-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-800 flex items-center">
                        <Upload className="w-5 h-5 mr-2 text-blue-600"/> Bulk Upload Participants
                    </h2>
                    <p className="text-sm text-gray-500">Upload participants from CSV file.</p>
                </div>
            </div>

            {activeStep === 'upload' && (
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-12 bg-gray-50 hover:border-blue-400 transition-colors">
                    <FileSpreadsheet className="w-16 h-16 text-gray-400 mb-4"/>
                    <h3 className="text-lg font-bold text-gray-700 mb-2">Select CSV File</h3>
                    <p className="text-sm text-gray-500 mb-6">Supported columns: Event Name, Participant Name, Branch, Mobile</p>
                    
                    <input 
                        type="file" 
                        accept=".csv" 
                        className="hidden" 
                        ref={fileInputRef}
                        onChange={handleFileChange}
                    />
                    
                    <Button 
                        onClick={handleBrowseClick}
                        className="bg-blue-600 hover:bg-blue-700 cursor-pointer"
                    >
                        Browse Files
                    </Button>
                </div>
            )}

            {(activeStep === 'preview' || activeStep === 'processing') && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between bg-blue-50 p-4 rounded-lg">
                        <div className="flex items-center gap-3">
                            <FileSpreadsheet className="w-8 h-8 text-blue-600"/>
                            <div>
                                <p className="font-bold text-gray-800">{file?.name}</p>
                                <p className="text-xs text-gray-500">{previewData.length} rows found</p>
                            </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={reset} disabled={uploading}>Change File</Button>
                    </div>

                    {validationErrors.length > 0 && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <h4 className="font-bold text-yellow-800 flex items-center mb-2">
                                <AlertTriangle className="w-4 h-4 mr-2"/> Validation Warnings
                            </h4>
                            <ul className="list-disc list-inside text-sm text-yellow-700 max-h-40 overflow-y-auto">
                                {validationErrors.map((err, idx) => <li key={idx}>{err}</li>)}
                            </ul>
                            <p className="text-xs text-yellow-600 mt-2 font-semibold">Rows with errors will be skipped during upload.</p>
                        </div>
                    )}

                    <div className="flex justify-end pt-4">
                        <Button 
                            onClick={handleUpload} 
                            disabled={uploading} 
                            className="bg-green-600 hover:bg-green-700 w-full md:w-auto"
                        >
                            {uploading ? <Loader2 className="animate-spin w-4 h-4 mr-2"/> : <Upload className="w-4 h-4 mr-2"/>}
                            {uploading ? 'Uploading...' : `Upload Valid Participants`}
                        </Button>
                    </div>
                </div>
            )}

            {activeStep === 'result' && uploadResult && (
                <div className="text-center py-8 space-y-6">
                    <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-10 h-10 text-green-600"/>
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900">Upload Complete</h3>
                        <p className="text-gray-500 mt-2">
                            Successfully added <span className="font-bold text-green-600">{uploadResult.success}</span> participants.
                        </p>
                    </div>
                    <Button onClick={reset} variant="outline">Upload Another File</Button>
                </div>
            )}
        </div>
    );
};

export default BulkUploadParticipants;