import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '@/utils/api';
import { LogOut, PlusCircle, CheckCircle, StopCircle, User, FileSpreadsheet } from 'lucide-react';
import QRCode from 'react-qr-code';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function TeacherDashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [activeSessions, setActiveSessions] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showNewSessionForm, setShowNewSessionForm] = useState(false);
    const [newSubject, setNewSubject] = useState('');
    const [newDuration, setNewDuration] = useState(60);
    const [creating, setCreating] = useState(false);
    const teacherSubjects = Array.isArray(user?.subjects)
        ? user.subjects.map((sub) => String(sub).trim()).filter(Boolean)
        : [];

    useEffect(() => {
        if (!user || user.role !== 'teacher') {
            navigate('/teacher/login');
            return;
        }
        fetchSessions();
    }, [user, navigate]);

    const fetchSessions = async () => {
        try {
            const res = await api.get('/sessions');
            // Ensure we are always setting an array, even if the API returns something else
            setActiveSessions(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error(err);
            setActiveSessions([]);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleCreateSession = async (e) => {
        e.preventDefault();
        setCreating(true);
        try {
            const subjectToUse = newSubject || teacherSubjects[0] || 'General';
            await api.post('/sessions', {
                subject: subjectToUse,
                durationMinutes: Number(newDuration)
            });
            setNewSubject('');
            setNewDuration(60);
            setShowNewSessionForm(false);

            // Re-fetch all active sessions so the map hook gets the proper Array shape
            await fetchSessions();
        } catch (err) {
            console.error(err);
            alert('Failed to create session');
        } finally {
            setCreating(false);
        }
    };

    const handleEndSession = async (sessionId) => {
        try {
            await api.put(`/sessions/${sessionId}/end`);
            fetchSessions();
        } catch (err) {
            console.error(err);
            alert('Failed to end session');
        }
    };

    const handleExport = async (sessionId) => {
        try {
            const response = await api.get(`/attendance/export/${sessionId}`, {
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `attendance_${sessionId}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (err) {
            console.error(err);
            alert('Failed to export records. No records might exist yet.');
        }
    };

    const renderQrCode = (session) => {
        const qrValue = session?.qrData || session?.qrCode;
        if (!qrValue) return null;

        const strValue = String(qrValue).trim();

        // If it starts with data:image or is suspiciously long (base64 image data), render as an image directly
        // This prevents the react-qr-code component from crashing with "code length overflow"
        if (strValue.startsWith('data:image') || strValue.length > 2000) {
            const src = strValue.startsWith('data:image') ? strValue : `data:image/png;base64,${strValue}`;
            return <img src={src} alt={`QR for ${session.sessionId}`} className="w-40 h-40" />;
        }

        return <QRCode value={strValue} size={160} level="H" />;
    };

    const formatExpiry = (expiresAt) => {
        if (!expiresAt) return 'N/A';
        const parsed = new Date(expiresAt);
        if (Number.isNaN(parsed.getTime())) return 'N/A';
        return parsed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-slate-50">
            <nav className="bg-emerald-700 shadow-md p-4 flex justify-between items-center text-white sticky top-0 z-50">
                <div className="flex items-center gap-2 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 justify-between">
                    <div className="flex items-center gap-2">
                        <User className="w-6 h-6" />
                        <h1 className="text-xl font-bold">Teacher Portal</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="font-medium mr-4 hidden sm:inline">Welcome, {user?.name}</span>
                        <Button variant="ghost" className="hover:bg-emerald-600 hover:text-white" onClick={handleLogout}>
                            <LogOut className="w-4 h-4 mr-2" /> Logout
                        </Button>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">

                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Active Sessions</h2>
                    <Button
                        onClick={() => setShowNewSessionForm(!showNewSessionForm)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md"
                    >
                        <PlusCircle className="w-4 h-4 mr-2" /> New Session
                    </Button>
                </div>

                {showNewSessionForm && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-8">
                        <Card className="border-emerald-100 shadow-md">
                            <CardHeader>
                                <CardTitle>Create New Attendance Session</CardTitle>
                                <CardDescription>Generate a QR code for your students to scan.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleCreateSession} className="flex flex-col sm:flex-row gap-6 items-end">
                                    <div className="w-full sm:w-1/3 space-y-2">
                                        <Label>Subject</Label>
                                        <Select value={newSubject} onValueChange={setNewSubject} required>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a subject" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {teacherSubjects.map(sub => (
                                                    <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                                                ))}
                                                {teacherSubjects.length === 0 && <SelectItem value="General">General</SelectItem>}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="w-full sm:w-1/3 space-y-2">
                                        <Label>Duration (Minutes)</Label>
                                        <Input
                                            type="number" min="5" max="180" value={newDuration} onChange={(e) => setNewDuration(e.target.value)} required
                                        />
                                    </div>
                                    <Button type="submit" disabled={creating} className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700">
                                        {creating ? 'Creating...' : 'Launch Session'}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activeSessions.length === 0 ? (
                        <div className="col-span-full text-center text-slate-500 py-16 bg-white rounded-xl border border-dashed border-slate-300">
                            No active sessions found. Create one to get started.
                        </div>
                    ) : (
                        activeSessions.map((session, i) => {
                            const sessionKey = session?.sessionId || session?._id || `session-${i}`;
                            const sessionId = session?.sessionId || session?._id || 'Unknown';
                            const subject = session?.subject || 'Untitled Session';

                            return (
                                <motion.div key={sessionKey} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                                    <Card className="flex flex-col h-full shadow-md hover:shadow-lg transition-shadow border-slate-200 overflow-hidden">
                                        <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <CardTitle className="text-xl text-slate-800">{subject}</CardTitle>
                                                    <p className="text-xs text-slate-400 mt-1 font-mono truncate max-w-[200px]" title={sessionId}>{sessionId}</p>
                                                </div>
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                                                    Live
                                                </span>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="flex-grow p-6 flex flex-col items-center">
                                            {(session.qrData || session.qrCode) && (
                                                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm mb-6 inline-block">
                                                    {renderQrCode(session)}
                                                </div>
                                            )}
                                            <div className="text-sm font-medium text-slate-600 flex items-center justify-center gap-2 bg-slate-100 px-4 py-2 rounded-full w-full">
                                                <CheckCircle className="w-4 h-4 text-emerald-500" />
                                                Expires: {formatExpiry(session?.expiresAt)}
                                            </div>
                                        </CardContent>
                                        <CardFooter className="bg-slate-50 border-t border-slate-100 p-4 flex justify-between gap-4">
                                            <Button
                                                variant="outline"
                                                onClick={() => handleExport(sessionId)}
                                                className="flex-1 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-800 border-none"
                                                disabled={sessionId === 'Unknown'}
                                            >
                                                <FileSpreadsheet className="w-4 h-4 mr-2" /> Export
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                onClick={() => handleEndSession(sessionId)}
                                                className="flex-1"
                                                disabled={sessionId === 'Unknown'}
                                            >
                                                <StopCircle className="w-4 h-4 mr-2" /> End
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                </motion.div>
                            )
                        })
                    )}
                </div>
            </main>
        </div>
    );
}
