import React, { useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle, XCircle, Play, Terminal, ShieldCheck, CalendarClock } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const SystemDiagnostics = () => {
    const { toast } = useToast();
    const [logs, setLogs] = useState([]);
    const [isRunning, setIsRunning] = useState(false);
    const [results, setResults] = useState({});

    const addLog = (msg, type = 'info') => {
        const timestamp = new Date().toLocaleTimeString();
        setLogs(prev => [...prev, { time: timestamp, msg, type }]);
        console.log(`[${type.toUpperCase()}] ${msg}`);
    };

    const runTest = async (name, testFn) => {
        setResults(prev => ({ ...prev, [name]: 'running' }));
        addLog(`Starting Test: ${name}...`, 'info');
        try {
            await testFn();
            setResults(prev => ({ ...prev, [name]: 'pass' }));
            addLog(`Test Passed: ${name}`, 'success');
        } catch (error) {
            console.error(error);
            setResults(prev => ({ ...prev, [name]: 'fail' }));
            addLog(`Test Failed: ${name} - ${error.message}`, 'error');
        }
    };

    const runAllTests = async () => {
        setIsRunning(true);
        setLogs([]);
        setResults({});

        try {
            // --- TEST: VERIFY SCHEDULE UPDATES ---
            await runTest('Verify Schedule Update', async () => {
                addLog('Checking critical event timings...');
                
                // Check specific events to verify the bulk update
                const checks = [
                    { name: 'Fashion Show', expectedStart: '18:00', expectedVenue: 'MAIN HALL (Red)' },
                    { name: 'Soap Carving', expectedStart: '09:00', expectedVenue: 'FINE FINGERS HALL (Orange)' },
                    { name: 'Instrumental Solo Doctors', expectedStart: '15:00', expectedVenue: 'SECOND FLOOR HALL (Blue)' },
                    { name: 'Cineduet Doctors', expectedStart: '15:00', expectedVenue: 'BASEMENT HALL (Green)' }
                ];

                for (const check of checks) {
                    const { data, error } = await supabase
                        .from('sigaram_events')
                        .select('*')
                        .ilike('name', check.name)
                        .single();
                    
                    if (error) throw new Error(`Could not find event: ${check.name}`);
                    
                    const eventDate = new Date(data.event_time);
                    // Convert to IST string HH:MM
                    const timeStr = eventDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Kolkata' });
                    
                    if (!timeStr.startsWith(check.expectedStart)) {
                        throw new Error(`${check.name} time mismatch. Expected ${check.expectedStart}, got ${timeStr}`);
                    }
                    if (data.location !== check.expectedVenue) {
                         throw new Error(`${check.name} venue mismatch. Expected ${check.expectedVenue}, got ${data.location}`);
                    }
                    addLog(`Verified ${check.name}: ${timeStr} @ ${data.location}`);
                }
                addLog('All schedule verifications passed.');
            });

            // --- TEST 1: ORGANIZER LOGIN FLOW ---
            await runTest('Organizer Identity', async () => {
                const testEmail = `test.org.${Date.now()}@example.com`;
                // 1. Create Org
                addLog(`Creating test organizer: ${testEmail}`);
                const { data: createData, error: createError } = await supabase.functions.invoke('create-judge-organizer', {
                    body: { email: testEmail, password: 'TestPass123!', fullName: 'Test Org Unit', role: 'organizer' }
                });
                if (createError) throw new Error(createError.message);
                
                // 2. Verify Role
                addLog(`Verifying role for User ID: ${createData.user.id}`);
                const { data: verifyData, error: verifyError } = await supabase.functions.invoke('verify-organizer-role', {
                    body: { user_id: createData.user.id }
                });
                if (verifyError) throw new Error(verifyError.message);
                
                if (!verifyData.is_organizer) throw new Error(`Role mismatch. Expected organizer, got ${verifyData.role}`);
                addLog('Organizer verified successfully.');
            });

            // --- TEST 2: PARTICIPANT LOGIN (MOBILE) ---
            await runTest('Participant Mobile Login', async () => {
                const testPhone = '9876543210';
                const defaultPass = '9876543210';

                // 1. Ensure Participant Exists
                addLog('Creating/Resetting test participant...');
                const { error: seedError } = await supabase.functions.invoke('save-team-participants', {
                    body: {
                        event_id: '00000000-0000-0000-0000-000000000000', // dummy event
                        is_team_event: false,
                        participants: [{ name: 'Test Participant', mobile: testPhone, email: 'test.part@example.com' }]
                    }
                });
                if (seedError) addLog('Warning: Seed might have failed if event not found, but proceeding if user exists.', 'warning');
                
                // 2. Attempt Login
                addLog(`Attempting login with ${testPhone}`);
                const { data: loginData, error: loginError } = await supabase.functions.invoke('participant-login-mobile', {
                    body: { phone_number: testPhone, password: defaultPass }
                });
                
                if (loginError) throw new Error(`Login function error: ${loginError.message}`);
                
                if (loginData?.success) {
                     addLog('Login successful with default password.');
                     if (loginData.participant.password_changed === false) {
                         addLog('First login detected correctly.');
                     } else {
                         addLog('Participant has already changed their password.', 'warning');
                     }
                } else {
                     throw new Error(loginData?.message || 'Login failed for an unknown reason.');
                }
            });

            // --- TEST 3: JUDGE/ORGANIZER DROPDOWNS ---
            await runTest('Dropdown Data Fetch', async () => {
                // Judges
                addLog("Fetching judges...");
                const { data: jData, error: jError } = await supabase.functions.invoke('get-all-judges');
                if (jError) throw jError;
                if (!Array.isArray(jData.judges)) throw new Error('Invalid judges response format');
                addLog(`Fetched ${jData.judges.length} judges.`);
                
                // Organizers
                addLog("Fetching organizers...");
                const { data: oData, error: oError } = await supabase.functions.invoke('get-all-organizers');
                if (oError) throw oError;
                if (!Array.isArray(oData.organizers)) throw new Error('Invalid organizers response format');
                addLog(`Fetched ${oData.organizers.length} organizers.`);
            });

            // --- TEST 4 & 6: EVENT PERSISTENCE (INDIVIDUAL & TEAM) ---
            await runTest('Event Data Persistence', async () => {
                // 1. Create Test Event
                addLog('Creating Temp Test Event "TestEvent"...');
                const eventName = `TestEvent-${Date.now()}`;
                const { data: eventData, error: eventError } = await supabase
                    .from('sigaram_events')
                    .insert({ name: eventName, category: 'Test', event_time: new Date().toISOString(), is_fine_arts_event: true })
                    .select()
                    .single();
                
                if (eventError) throw eventError;
                const eventId = eventData.id;

                // 2. Save Individual Participants
                addLog('Saving 3 Individual Participants...');
                const individuals = [
                    { name: 'P1', mobile: '1111111111' },
                    { name: 'P2', mobile: '2222222222' },
                    { name: 'P3', mobile: '3333333333' }
                ];
                const {error: saveError} = await supabase.functions.invoke('save-team-participants', {
                    body: { event_id: eventId, is_team_event: false, participants: individuals }
                });
                if(saveError) throw new Error(`Save individuals failed: ${saveError.message}`);
                addLog('Participants saved: 3');


                // 3. Verify Individuals
                const { data: verifyInd } = await supabase.functions.invoke('get-team-participants', { body: { event_id: eventId } });
                if (verifyInd.individuals.length !== 3) throw new Error(`Expected 3 individuals, found ${verifyInd.individuals.length}`);
                addLog(`Participants loaded: ${verifyInd.individuals.length}`);
                addLog('Individual persistence verified.');

                // 4. Save Team Participants
                addLog('Saving team "Team1" with 3 members...');
                const team = [{ team_name: 'Team1', column_number: 1, name: 'Member1' }, { team_name: 'Team1', column_number: 2, name: 'Member2' }, { team_name: 'Team1', column_number: 3, name: 'Member3' }];

                const {error: saveTeamError} = await supabase.functions.invoke('save-team-participants', {
                    body: { event_id: eventId, is_team_event: true, participants: team }
                });
                if(saveTeamError) throw new Error(`Save team failed: ${saveTeamError.message}`);

                // 5. Verify Teams
                const { data: verifyTeam } = await supabase.functions.invoke('get-team-participants', { body: { event_id: eventId } });
                if (verifyTeam.teams.length !== 1) throw new Error(`Expected 1 team, found ${verifyTeam.teams.length}`);
                const team1 = verifyTeam.teams.find(t => t.team_name === 'Team1');
                if (!team1 || team1.members.length !== 3) throw new Error(`Team1 member count mismatch. Expected 3, found ${team1?.members.length || 0}`);
                addLog('Team persistence verified.');

                // Cleanup
                await supabase.from('sigaram_events').delete().eq('id', eventId);
            });

            // --- TEST 5: SCHEDULE EXPORT ---
            await runTest('Schedule Export', async () => {
                addLog('Creating event with time 10:00...');
                const eventName = `ExportTest-${Date.now()}`;
                 const { data: eventData, error: eventError } = await supabase
                    .from('sigaram_events')
                    .insert({ name: eventName, category: 'Export Test', event_time: '2025-12-07T10:00:00+05:30', is_fine_arts_event: true })
                    .select()
                    .single();
                if (eventError) throw eventError;

                addLog('Updating event time to 11:00...');
                const { error: updateError } = await supabase
                    .from('sigaram_events')
                    .update({ revised_time: '2025-12-07T11:00:00+05:30' })
                    .eq('id', eventData.id);
                if (updateError) throw updateError;
                
                const { data, error } = await supabase.functions.invoke('export-schedule-csv-fixed');
                if (error) throw error;
                if (!data.csv || typeof data.csv !== 'string') throw new Error('No CSV data returned');
                
                const lines = data.csv.split('\n');
                const eventLine = lines.find(line => line.includes(eventName));
                if (!eventLine) throw new Error(`Event ${eventName} not found in exported CSV.`);

                // Assuming "Final Scheduled Time" is the last column
                const columns = eventLine.split(',');
                const finalTime = columns[columns.length - 1].trim();

                if (!finalTime.includes('11:00')) {
                    throw new Error(`Expected final time 11:00, but CSV shows "${finalTime}"`);
                }
                addLog('CSV export shows correct revised time (11:00).');
                
                // Cleanup
                await supabase.from('sigaram_events').delete().eq('id', eventData.id);
            });

            // --- TEST 7: COUNTDOWN TIMER ---
            await runTest('Countdown Logic', async () => {
                addLog('Checking countdown timer. Visual check on /sigaram/fine_arts/FineArtsHome required.');
                const target = new Date('2025-12-07T08:00:00+05:30');
                const now = new Date();
                const diff = target - now;

                const seconds = Math.floor((diff / 1000) % 60);
                const minutes = Math.floor((diff / 1000 / 60) % 60);
                const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
                const days = Math.floor(diff / (1000 * 60 * 60 * 24));

                if (diff > 0) {
                    addLog(`Time remaining: ${days}d ${hours}h ${minutes}m ${seconds}s. Timer should be updating every second.`);
                } else {
                    addLog('Event has started. Timer should show 00:00:00:00.');
                }
            });

            // --- TEST 8: LIVE EVENT TRACKER ---
            await runTest('Live Event Tracker', async () => {
                 // 1. Create a dummy event to track
                const { data: event, error: eventErr } = await supabase.from('sigaram_events').insert({ name: 'Live Track Test Event', category: 'Test', event_time: new Date() }).select().single();
                if(eventErr) throw new Error(`Could not create test event: ${eventErr.message}`);

                // 2. Update Live Status for Hall 1
                addLog(`Updating Hall 1 with event: ${event.name}`);
                const { error: updateError } = await supabase.functions.invoke('update-live-event', {
                    body: { hall_number: 1, current_event_id: event.id, next_event_id: null }
                });
                if (updateError) throw updateError;
                addLog('Hall 1 updated. Verification on FineArtsHome required to see real-time update.');
                
                // Cleanup
                await supabase.from('sigaram_live_events_tracker').delete().eq('hall_number', 1);
                await supabase.from('sigaram_events').delete().eq('id', event.id);
            });


        } catch (err) {
            addLog(`Critical Test Suite Failure: ${err.message}`, 'error');
        } finally {
            setIsRunning(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-5xl mx-auto space-y-6">
                <div className="flex items-center justify-between bg-white p-6 rounded-xl shadow-sm">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                            <ShieldCheck className="w-8 h-8 mr-3 text-blue-600"/>
                            System Diagnostics & Verification Suite
                        </h1>
                        <p className="text-gray-500">Automated testing for all critical system functions</p>
                    </div>
                    <Button size="lg" onClick={runAllTests} disabled={isRunning} className={isRunning ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'}>
                        {isRunning ? <Loader2 className="w-5 h-5 animate-spin mr-2"/> : <Play className="w-5 h-5 mr-2"/>}
                        {isRunning ? 'Running Tests...' : 'Run Comprehensive Tests'}
                    </Button>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {/* Status Cards */}
                    <div className="md:col-span-1 space-y-4">
                        {['Verify Schedule Update', 'Organizer Identity', 'Participant Mobile Login', 'Dropdown Data Fetch', 'Event Data Persistence', 'Schedule Export', 'Countdown Logic', 'Live Event Tracker'].map((test) => (
                            <Card key={test} className="p-4 flex items-center justify-between">
                                <span className="font-medium text-sm">{test}</span>
                                {results[test] === 'running' && <Loader2 className="w-5 h-5 animate-spin text-blue-500"/>}
                                {results[test] === 'pass' && <CheckCircle className="w-5 h-5 text-green-500"/>}
                                {results[test] === 'fail' && <XCircle className="w-5 h-5 text-red-500"/>}
                                {!results[test] && <span className="w-5 h-5 block rounded-full bg-gray-200"></span>}
                            </Card>
                        ))}
                    </div>

                    {/* Console Output */}
                    <Card className="md:col-span-2">
                         <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Terminal className="w-4 h-4"/>
                                System Log
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="bg-black text-green-400 font-mono p-4 h-[440px] overflow-y-auto rounded-b-lg text-sm">
                            <div className="space-y-1">
                                {logs.length === 0 && <span className="text-gray-500 italic">Ready to start diagnostics...</span>}
                                {logs.map((log, i) => (
                                    <div key={i} className={`flex gap-3 ${log.type === 'error' ? 'text-red-400' : log.type === 'warning' ? 'text-yellow-400' : 'text-green-400'}`}>
                                        <span className="opacity-50 shrink-0">[{log.time}]</span>
                                        <span>{log.msg}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default SystemDiagnostics;