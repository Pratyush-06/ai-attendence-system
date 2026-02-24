import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '@/utils/api';
import { LogOut, MapPin, ScanLine, Camera, History, User } from 'lucide-react';
import BarcodeScannerComponent from "react-qr-barcode-scanner";
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function StudentDashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [attendanceHistory, setAttendanceHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    // Scanner & Marking State
    const [isScanning, setIsScanning] = useState(false);
    const [scannedSessionId, setScannedSessionId] = useState('');
    const [locationStatus, setLocationStatus] = useState('');
    const [markingError, setMarkingError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isMarking, setIsMarking] = useState(false);

    useEffect(() => {
        if (!user || user.role !== 'student') {
            navigate('/student/login');
            return;
        }
        fetchHistory();
    }, [user, navigate]);

    const fetchHistory = async () => {
        try {
            const res = await api.get('/attendance/student');
            setAttendanceHistory(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const startScanner = () => {
        setScannedSessionId('');
        setMarkingError('');
        setSuccessMessage('');
        setIsScanning(true);
    };

    const handleScanResult = (err, result) => {
        if (result) {
            setIsScanning(false);
            try {
                const data = JSON.parse(result.text);
                if (data.sessionId) {
                    setScannedSessionId(data.sessionId);
                    markAttendance(data.sessionId);
                } else {
                    setMarkingError("Invalid QR Code Format");
                }
            } catch (e) {
                setScannedSessionId(result.text);
                markAttendance(result.text);
            }
        }
    };

    const markAttendance = (sessionId) => {
        setMarkingError('');
        setSuccessMessage('');
        setIsMarking(true);
        setLocationStatus('Acquiring location...');

        if (!navigator.geolocation) {
            setMarkingError('Geolocation is not supported by your browser.');
            setIsMarking(false);
            setLocationStatus('');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                setLocationStatus('Location acquired. Verifying attendance...');
                try {
                    const response = await api.post('/attendance/mark', {
                        sessionId,
                        location: {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude
                        }
                    });

                    setSuccessMessage(response.data.message || 'Attendance Marked!');
                    fetchHistory(); // Refresh the list
                } catch (err) {
                    setMarkingError(err.response?.data?.error || 'Failed to mark attendance.');
                } finally {
                    setIsMarking(false);
                    setLocationStatus('');
                }
            },
            (error) => {
                setMarkingError('Unable to retrieve your location. Please ensure location services are enabled and permissions are granted.');
                setIsMarking(false);
                setLocationStatus('');
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-slate-50">
            <nav className="bg-indigo-700 shadow-md p-4 flex justify-between items-center text-white sticky top-0 z-50">
                <div className="flex items-center gap-2 max-w-4xl mx-auto w-full px-4 sm:px-6 justify-between">
                    <div className="flex items-center gap-2">
                        <User className="w-6 h-6" />
                        <h1 className="text-xl font-bold">Student Portal</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="font-medium mr-4 hidden sm:inline">{user?.name} ({user?.rollNo})</span>
                        <Button variant="ghost" className="hover:bg-indigo-600 hover:text-white" onClick={handleLogout}>
                            <LogOut className="w-4 h-4 mr-2" /> Logout
                        </Button>
                    </div>
                </div>
            </nav>

            <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">

                <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                    <Card className="shadow-lg border-indigo-100 overflow-hidden relative">
                        <CardHeader className="bg-white border-b border-slate-100 pb-4">
                            <CardTitle className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                                <ScanLine className="w-6 h-6 text-indigo-600" /> Mark Today's Attendance
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8">
                            {!isScanning && !isMarking && (
                                <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-indigo-50/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <Camera className="w-20 h-20 text-indigo-200 mb-6 group-hover:scale-110 transition-transform duration-300 relative z-10" />
                                    <p className="text-slate-600 text-center max-w-md mb-8 relative z-10 text-lg">
                                        When your professor displays the session QR code on the screen, scan it here.
                                        <br /><span className="text-sm font-semibold text-indigo-600 mt-2 block">Location permissions are required.</span>
                                    </p>
                                    <Button
                                        onClick={startScanner}
                                        size="lg"
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-6 px-10 rounded-full shadow-lg transition-transform transform hover:scale-105 relative z-10"
                                    >
                                        <ScanLine className="w-5 h-5 mr-2" /> Start Scanner
                                    </Button>
                                </div>
                            )}

                            {isScanning && (
                                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center">
                                    <div className="w-full max-w-sm overflow-hidden rounded-2xl shadow-2xl border-4 border-indigo-500 mb-6 bg-black relative aspect-square">
                                        <BarcodeScannerComponent
                                            width="100%"
                                            height="100%"
                                            onUpdate={handleScanResult}
                                        />
                                        <div className="absolute inset-0 pointer-events-none border-[60px] border-black/50"></div>
                                        <div className="absolute inset-0 pointer-events-none border-2 border-indigo-500 m-8 rounded animate-pulse"></div>
                                    </div>
                                    <Button variant="outline" onClick={() => setIsScanning(false)} className="text-slate-600">
                                        Cancel Scan
                                    </Button>
                                </motion.div>
                            )}

                            {(isMarking || locationStatus) && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-12 px-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mb-6"></div>
                                    <p className="text-xl font-bold text-indigo-900">{locationStatus}</p>
                                    <p className="text-md text-indigo-600 mt-3 flex items-center gap-2 font-medium">
                                        <MapPin className="w-5 h-5 animate-bounce" /> Verifying Geofence
                                    </p>
                                </motion.div>
                            )}

                            {successMessage && (
                                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 p-6 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 flex items-center justify-center gap-4 font-semibold text-lg shadow-sm">
                                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-2xl">✅</div>
                                    {successMessage}
                                </motion.div>
                            )}

                            {markingError && (
                                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 p-6 bg-red-50 border border-red-200 rounded-xl text-red-800 flex flex-col items-center justify-center text-center font-semibold shadow-sm">
                                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-3 text-2xl">❌</div>
                                    {markingError}
                                </motion.div>
                            )}
                        </CardContent>
                    </Card>
                </motion.section>

                <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
                    <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2 px-2">
                        <History className="w-6 h-6 text-indigo-600" /> Attendance History
                    </h2>

                    <Card className="shadow-md border-slate-200 overflow-hidden">
                        {attendanceHistory.length === 0 ? (
                            <div className="p-12 text-center text-slate-500 bg-slate-50">
                                <History className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                                <p className="text-lg">You haven't marked attendance for any classes yet.</p>
                            </div>
                        ) : (
                            <ul className="divide-y divide-slate-100">
                                {attendanceHistory.map((record) => (
                                    <li key={record._id} className="p-5 sm:px-6 hover:bg-slate-50 transition-colors">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-lg font-bold text-slate-900 truncate">
                                                    {record.subject}
                                                </p>
                                                <div className="mt-1.5 flex items-center text-sm text-slate-500 gap-4 font-medium">
                                                    <span className="flex items-center gap-1">📅 {record.date}</span>
                                                    <span className="flex items-center gap-1">⏰ {record.time}</span>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold shadow-sm ${record.status === 'Present' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-red-100 text-red-800 border border-red-200'
                                                    }`}>
                                                    {record.status}
                                                </span>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </Card>
                </motion.section>
            </main>
        </div>
    );
}
