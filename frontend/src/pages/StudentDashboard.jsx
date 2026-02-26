import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '@/utils/api';
import { addToQueue, processQueue, getQueue } from '@/utils/offlineQueue';
import { LogOut, MapPin, ScanLine, Camera, History, User, Keyboard, CheckCircle, XCircle } from 'lucide-react';
import BarcodeScannerComponent from "react-qr-barcode-scanner";
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function StudentDashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [attendanceHistory, setAttendanceHistory] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const [isScanning, setIsScanning] = useState(false);
    const [showCodeInput, setShowCodeInput] = useState(false);
    const [classCodeInput, setClassCodeInput] = useState('');
    const [locationStatus, setLocationStatus] = useState('');
    const [markingError, setMarkingError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [alreadyMarked, setAlreadyMarked] = useState(false);
    const [isMarking, setIsMarking] = useState(false);

    useEffect(() => {
        if (!user || user.role !== 'student') { navigate('/student/login'); return; }
        fetchData(); syncOfflineQueue();
    }, [user, navigate]);

    useEffect(() => {
        const handleOnline = () => syncOfflineQueue();
        window.addEventListener('online', handleOnline);
        return () => window.removeEventListener('online', handleOnline);
    }, []);

    const syncOfflineQueue = async () => {
        const queue = getQueue();
        if (queue.length > 0) {
            toast.info(`Syncing ${queue.length} offline record(s)...`);
            const result = await processQueue(api);
            if (result.synced > 0) { toast.success(`${result.synced} synced!`); fetchData(); }
        }
    };

    const fetchData = async () => {
        try {
            const [historyRes, statsRes] = await Promise.all([api.get('/attendance/student'), api.get('/attendance/student/stats')]);
            setAttendanceHistory(historyRes.data); setStats(statsRes.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleLogout = () => { logout(); navigate('/'); };
    const startScanner = () => { resetState(); setIsScanning(true); };
    const resetState = () => { setMarkingError(''); setSuccessMessage(''); setAlreadyMarked(false); setShowCodeInput(false); setClassCodeInput(''); };

    const handleScanResult = (err, result) => {
        if (result) {
            setIsScanning(false);
            try { const data = JSON.parse(result.text); if (data.sessionId) markAttendance(data.sessionId); else setMarkingError("Invalid QR"); }
            catch (e) { markAttendance(result.text); }
        }
    };

    const handleClassCodeSubmit = (e) => {
        e.preventDefault();
        if (classCodeInput.length !== 6) { setMarkingError('Code must be 6 digits'); return; }
        markAttendanceByCode(classCodeInput);
    };

    const markAttendance = (sessionId) => {
        setMarkingError(''); setSuccessMessage(''); setAlreadyMarked(false); setIsMarking(true); setLocationStatus('Checking location...');
        if (!navigator.geolocation) { setMarkingError('Geolocation not supported.'); setIsMarking(false); return; }
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                setLocationStatus('Verifying...');
                const location = { lat: position.coords.latitude, lng: position.coords.longitude };
                try {
                    const response = await api.post('/attendance/mark', { sessionId, location });
                    if (response.data.alreadyMarked) { setAlreadyMarked(true); setSuccessMessage(response.data.message || 'Already marked'); }
                    else { setSuccessMessage(response.data.message || 'Marked successfully!'); fetchData(); }
                } catch (err) {
                    if (!err.response) { addToQueue({ sessionId, location }); setSuccessMessage('Saved offline'); }
                    else {
                        if (err.response?.data?.alreadyMarked) { setAlreadyMarked(true); setSuccessMessage(err.response.data.message); }
                        else { setMarkingError(err.response?.data?.error || 'Failed'); }
                    }
                } finally { setIsMarking(false); setLocationStatus(''); }
            },
            () => { setMarkingError('Location unavailable.'); setIsMarking(false); setLocationStatus(''); },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    const markAttendanceByCode = (code) => {
        setMarkingError(''); setSuccessMessage(''); setAlreadyMarked(false); setIsMarking(true); setLocationStatus('Checking location...');
        if (!navigator.geolocation) { setMarkingError('Geolocation not supported.'); setIsMarking(false); return; }
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                setLocationStatus('Verifying...');
                const location = { lat: position.coords.latitude, lng: position.coords.longitude };
                try {
                    const response = await api.post('/attendance/mark-by-code', { classCode: code, location });
                    if (response.data.alreadyMarked) { setAlreadyMarked(true); setSuccessMessage(response.data.message); }
                    else { setSuccessMessage(response.data.message || 'Marked successfully!'); fetchData(); }
                } catch (err) {
                    if (!err.response) { addToQueue({ classCode: code, location }); setSuccessMessage('Saved offline'); }
                    else { setMarkingError(err.response?.data?.error || 'Failed'); }
                } finally { setIsMarking(false); setLocationStatus(''); }
            },
            () => { setMarkingError('Location unavailable.'); setIsMarking(false); setLocationStatus(''); },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-[#fdfaf6]">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#e0dad2] border-t-[#1f1d1d]"></div>
        </div>
    );

    const overallPct = stats?.overall?.percentage || 0;

    return (
        <div className="min-h-screen bg-[#fdfaf6]">
            {/* Top Navigation */}
            <nav className="border-b-2 border-[#1f1d1d]/10 bg-white sticky top-0 z-50">
                <div className="flex items-center max-w-7xl mx-auto w-full px-6 py-4 justify-between">
                    <div className="flex items-center gap-3">
                        <h1 className="text-xl font-black text-[#1f1d1d]">SmartAttend</h1>
                        <span className="bg-[#cdb4eb] text-[#1f1d1d] text-xs font-bold px-3 py-1 rounded-full hidden sm:block">Student</span>
                    </div>
                    <button onClick={handleLogout} className="podia-btn py-2 px-5 text-sm">Logout</button>
                </div>
            </nav>

            <main className="max-w-5xl mx-auto py-10 px-6 grid grid-cols-1 lg:grid-cols-12 gap-10">

                {/* Left Column */}
                <div className="lg:col-span-5 space-y-10">

                    {/* Profile & Overall Stats Card */}
                    <div className="podia-card-blue rounded-[32px] p-8 md:p-10 relative overflow-hidden flex flex-col items-center text-center">
                        <div className="w-24 h-24 bg-white text-[#1f1d1d] rounded-full flex items-center justify-center text-4xl font-black mb-6 shadow-md border-4 border-white">
                            {user?.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <h2 className="text-3xl font-black mb-1 text-[#1f1d1d]">{user?.name}</h2>
                        <p className="font-bold text-[#1f1d1d]/70 font-mono mb-8 bg-white/30 px-4 py-1.5 rounded-full inline-block">{user?.rollNo}</p>

                        <div className="bg-white rounded-[24px] p-6 w-full shadow-sm text-center">
                            <p className="font-bold text-sm mb-1 opacity-80 uppercase tracking-wide">Overall Attendance</p>
                            <div className="text-5xl font-black text-[#1f1d1d] mb-4">{overallPct}%</div>
                            <div className="w-full bg-[#fdfaf6] rounded-full h-3">
                                <div className="bg-[#1f1d1d] h-3 rounded-full transition-all" style={{ width: `${overallPct}%` }}></div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions / Mark Attendance Card */}
                    <div className="podia-card-white border-2 border-[#e0dad2] rounded-[32px] p-8 md:p-10 text-center">
                        <h3 className="text-2xl font-black mb-2">Mark Attendance</h3>
                        <p className="font-semibold text-[#1f1d1d]/60 mb-8">Scan the live QR code or enter the 6-digit class code provided by the teacher.</p>

                        {!isScanning && !showCodeInput && !isMarking && !locationStatus && (
                            <div className="flex flex-col gap-4">
                                <button onClick={startScanner} className="podia-btn w-full py-5 text-lg">
                                    <Camera className="w-5 h-5 mr-3" /> Open Scanner
                                </button>
                                <button onClick={() => setShowCodeInput(true)} className="podia-btn-outline w-full py-5 text-lg bg-[#faf8f5]">
                                    <Keyboard className="w-5 h-5 mr-3" /> Enter Class Code
                                </button>
                            </div>
                        )}

                        {showCodeInput && !isMarking && (
                            <form onSubmit={handleClassCodeSubmit} className="flex flex-col gap-4">
                                <input type="text" maxLength={6} value={classCodeInput} onChange={e => setClassCodeInput(e.target.value.replace(/\D/g, ''))}
                                    className="podia-input h-16 text-center text-3xl font-black font-mono tracking-[0.3em] bg-[#faf8f5]" placeholder="000000" autoFocus />
                                <div className="flex gap-3">
                                    <button type="submit" className="podia-btn flex-1">Submit</button>
                                    <button type="button" onClick={resetState} className="podia-btn-outline px-6">Cancel</button>
                                </div>
                            </form>
                        )}

                        {isScanning && (
                            <div className="flex flex-col items-center">
                                <div className="w-full overflow-hidden rounded-[24px] mb-6 flex items-center justify-center bg-black aspect-square max-w-xs border-4 border-[#1f1d1d]">
                                    <BarcodeScannerComponent width="100%" height="100%" onUpdate={handleScanResult} />
                                </div>
                                <button onClick={resetState} className="podia-btn-outline w-full">Cancel Scanner</button>
                            </div>
                        )}

                        {(isMarking || locationStatus) && (
                            <div className="py-8 bg-[#faf8f5] rounded-[24px] border border-[#e0dad2] flex flex-col items-center">
                                <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#d4cfc8] border-t-[#1f1d1d] mb-4"></div>
                                <p className="font-bold text-lg">{locationStatus}</p>
                            </div>
                        )}

                        {successMessage && (
                            <div className={`mt-6 p-6 rounded-[24px] font-bold text-lg flex flex-col items-center border-2 ${alreadyMarked ? 'bg-[#f2ce6e]/30 border-[#f2ce6e] text-[#1f1d1d]' : 'bg-[#a1d1b6]/40 border-[#a1d1b6] text-[#1f1d1d]'}`}>
                                <CheckCircle className="w-10 h-10 mb-3 opacity-90" />
                                {successMessage}
                                <button onClick={resetState} className="mt-4 text-sm underline opacity-70">Mark another</button>
                            </div>
                        )}

                        {markingError && (
                            <div className="mt-6 p-6 rounded-[24px] font-bold text-lg flex flex-col items-center border-2 bg-[#ef4444]/10 border-[#ef4444] text-[#ef4444]">
                                <XCircle className="w-10 h-10 mb-3" />
                                {markingError}
                                <button onClick={resetState} className="mt-4 text-sm underline opacity-80 text-[#1f1d1d]">Try again</button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column */}
                <div className="lg:col-span-7 space-y-10">

                    {/* Subjects View */}
                    <div>
                        <h3 className="text-2xl font-black mb-6 flex items-center gap-2">Subject Breakdown</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {stats?.subjects?.map((subj, idx) => {
                                const colors = ['bg-[#f2ce6e]', 'bg-[#e6a356]', 'bg-[#cdb4eb]', 'bg-[#a6c5d4]', 'bg-[#a1d1b6]'];
                                const cardColor = colors[idx % colors.length];
                                return (
                                    <div key={subj.name} className={`${cardColor} p-6 rounded-[24px] flex flex-col justify-between shadow-sm`}>
                                        <div className="font-bold text-lg mb-4 whitespace-nowrap overflow-hidden text-ellipsis">{subj.name}</div>
                                        <div className="flex items-end justify-between">
                                            <div>
                                                <div className="text-4xl font-black">{subj.percentage}%</div>
                                                <div className="text-sm font-bold opacity-70 mt-1">{subj.present} / {subj.total} attended</div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* History View */}
                    <div>
                        <h3 className="text-2xl font-black mb-6">Recent History</h3>
                        <div className="podia-card-white border-2 border-[#e0dad2] rounded-[32px] overflow-hidden">
                            {attendanceHistory.length === 0 ? (
                                <div className="p-12 text-center text-[#1f1d1d]/50 font-bold">No history found.</div>
                            ) : (
                                <div className="divide-y-2 divide-[#f0ebe1]">
                                    {attendanceHistory.slice(0, 10).map((record) => (
                                        <div key={record._id} className="p-6 flex items-center justify-between hover:bg-[#faf8f5] transition-colors">
                                            <div>
                                                <p className="font-bold text-lg mb-1">{record.subject}</p>
                                                <p className="text-sm font-semibold text-[#1f1d1d]/60">{record.date} at {record.time}</p>
                                            </div>
                                            <div className={`px-4 py-2 font-bold rounded-full text-sm ${record.status === 'Present' ? 'bg-[#a1d1b6]/40 text-[#1f1d1d]' : 'bg-[#ef4444]/20 text-[#ef4444]'}`}>
                                                {record.status}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </main>
        </div>
    );
}
