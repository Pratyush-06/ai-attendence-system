import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '@/utils/api';
import socket from '@/utils/socket';
import { LogOut, PlusCircle, StopCircle, User, FileSpreadsheet, BarChart3, Copy, Users, Zap, History, ChevronDown, ChevronUp, Clock, XCircle, CheckCircle } from 'lucide-react';
import QRCode from 'react-qr-code';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

function CountdownTimer({ expiresAt }) {
    const [timeLeft, setTimeLeft] = useState(0);
    const [totalTime, setTotalTime] = useState(0);

    useEffect(() => {
        if (!expiresAt) return;
        const expires = new Date(expiresAt).getTime();
        const now = Date.now();
        const total = Math.max(0, Math.floor((expires - now) / 1000));
        setTotalTime(total);
        setTimeLeft(total);
        const interval = setInterval(() => {
            const remaining = Math.max(0, Math.floor((expires - Date.now()) / 1000));
            setTimeLeft(remaining);
            if (remaining <= 0) clearInterval(interval);
        }, 1000);
        return () => clearInterval(interval);
    }, [expiresAt]);

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const progress = totalTime > 0 ? timeLeft / totalTime : 0;
    const isExpiring = timeLeft < 60;
    const isExpired = timeLeft <= 0;

    return (
        <div className="flex flex-col items-center gap-1">
            <div className="w-full bg-[#e0dad2] rounded-full h-3 max-w-[160px] overflow-hidden">
                <div
                    className={`h-full transition-all duration-1000 ease-linear ${isExpired ? 'bg-[#ef4444]' : isExpiring ? 'bg-[#e6a356]' : 'bg-[#1f1d1d]'}`}
                    style={{ width: `${progress * 100}%` }}
                ></div>
            </div>
            <span className={`text-lg font-bold font-mono mt-2 ${isExpired ? 'text-[#ef4444]' : isExpiring ? 'text-[#e6a356]' : 'text-[#1f1d1d]'}`}>
                {isExpired ? 'EXPIRED' : `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`}
            </span>
            <span className="text-sm font-semibold text-[#1f1d1d]/60">{isExpired ? 'Session ended' : 'Time remaining'}</span>
        </div>
    );
}

export default function TeacherDashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [activeSessions, setActiveSessions] = useState([]);
    const [pastSessions, setPastSessions] = useState([]);
    const [expandedSession, setExpandedSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('active');

    const [showNewSessionForm, setShowNewSessionForm] = useState(false);
    const [newSubject, setNewSubject] = useState('');
    const [newDuration, setNewDuration] = useState(60);
    const [newTotalStudents, setNewTotalStudents] = useState(60);
    const [creating, setCreating] = useState(false);
    const [lastSubject, setLastSubject] = useState('');
    const [liveAttendance, setLiveAttendance] = useState({});

    const teacherSubjects = Array.isArray(user?.subjects)
        ? user.subjects.map((sub) => String(sub).trim()).filter(Boolean) : [];

    useEffect(() => {
        if (!user || user.role !== 'teacher') { navigate('/teacher/login'); return; }
        fetchSessions(); fetchHistory();
    }, [user, navigate]);

    useEffect(() => {
        socket.connect();
        socket.on('attendanceMarked', (data) => {
            setLiveAttendance(prev => {
                const session = prev[data.sessionId] || { count: 0, recent: [] };
                return {
                    ...prev, [data.sessionId]: {
                        count: data.presentCount, totalStudents: data.totalStudents,
                        recent: [{ name: data.name, rollNo: data.rollNo, time: data.time }, ...session.recent].slice(0, 10)
                    }
                };
            });
            toast.success(`✓ ${data.name} marked present`);
        });
        socket.on('sessionEnded', (data) => { toast.info(`Session ended: ${data.presentCount} present`); fetchSessions(); fetchHistory(); });
        return () => { socket.off('attendanceMarked'); socket.off('sessionEnded'); socket.disconnect(); };
    }, []);

    useEffect(() => { activeSessions.forEach(session => socket.emit('joinSession', session.sessionId)); }, [activeSessions]);

    const fetchSessions = async () => {
        try {
            const res = await api.get('/sessions');
            const sessions = Array.isArray(res.data) ? res.data : [];
            setActiveSessions(sessions);
            for (const session of sessions) {
                try {
                    const attRes = await api.get(`/attendance/session/${session.sessionId}`);
                    const records = Array.isArray(attRes.data) ? attRes.data : [];
                    const presentRecords = records.filter(r => r.status === 'Present');
                    setLiveAttendance(prev => ({
                        ...prev, [session.sessionId]: {
                            count: presentRecords.length, totalStudents: session.totalStudents || 60,
                            recent: presentRecords.slice(0, 5).map(r => ({ name: r.rollNo, rollNo: r.rollNo, time: r.time }))
                        }
                    }));
                } catch (e) { }
            }
        } catch (err) { setActiveSessions([]); }
        finally { setLoading(false); }
    };

    const fetchHistory = async () => { try { const res = await api.get('/sessions/history'); setPastSessions(Array.isArray(res.data) ? res.data : []); } catch (err) { } };
    const handleLogout = () => { logout(); navigate('/'); };

    const handleCreateSession = async (e) => {
        e.preventDefault(); setCreating(true);
        try {
            const subjectToUse = newSubject || teacherSubjects[0] || 'General';
            await api.post('/sessions', { subject: subjectToUse, durationMinutes: Number(newDuration), totalStudents: Number(newTotalStudents) });
            setLastSubject(subjectToUse); setNewSubject(''); setNewDuration(60); setShowNewSessionForm(false);
            toast.success('Session created!'); await fetchSessions();
        } catch (err) { toast.error('Failed to create session'); }
        finally { setCreating(false); }
    };

    const handleStartNextSession = async () => {
        if (!lastSubject) { setShowNewSessionForm(true); return; }
        setCreating(true);
        try { await api.post('/sessions', { subject: lastSubject, durationMinutes: 60, totalStudents: Number(newTotalStudents) }); toast.success(`Quick session started!`); await fetchSessions(); }
        catch (err) { toast.error('Failed'); } finally { setCreating(false); }
    };

    const handleEndSession = async (sessionId) => {
        if (!window.confirm("Are you sure you want to end this session?")) return;
        try { await api.put(`/sessions/${sessionId}/end`); toast.success(`Session ended successfully.`); fetchSessions(); fetchHistory(); }
        catch (err) { toast.error('Failed'); }
    };

    const handleExport = async (sessionId) => {
        try {
            const response = await api.get(`/attendance/export/${sessionId}`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data])); const link = document.createElement('a');
            link.href = url; link.setAttribute('download', `attendance_${sessionId}.xlsx`);
            document.body.appendChild(link); link.click(); link.parentNode.removeChild(link); toast.success('Exported successfully');
        } catch (err) { toast.error('Export failed'); }
    };

    const copyClassCode = (code) => { navigator.clipboard.writeText(code); toast.success('Copied to clipboard'); };

    const renderQrCode = (session) => {
        const qrValue = session?.qrData || session?.qrCode;
        if (!qrValue) return null;
        const strValue = String(qrValue).trim();
        if (strValue.startsWith('data:image') || strValue.length > 2000) {
            return <img src={strValue.startsWith('data:image') ? strValue : `data:image/png;base64,${strValue}`} alt="QR" className="w-40 h-40" />;
        }
        return <QRCode value={strValue} size={160} level="H" />;
    };

    const formatDate = (d) => { if (!d) return 'N/A'; return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); };
    const formatTime = (d) => { if (!d) return ''; return new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }); };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-[#fdfaf6]">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#e0dad2] border-t-[#1f1d1d]"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#fdfaf6]">
            {/* Top Navigation Bar */}
            <nav className="border-b-2 border-[#1f1d1d]/10 bg-white sticky top-0 z-50">
                <div className="flex items-center max-w-7xl mx-auto w-full px-6 py-4 justify-between">
                    <div className="flex items-center gap-3">
                        <h1 className="text-xl font-black text-[#1f1d1d]">SmartAttend</h1>
                        <span className="bg-[#a6c5d4] text-[#1f1d1d] text-xs font-bold px-3 py-1 rounded-full hidden sm:block">Teacher</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/teacher/analytics')} className="font-bold text-[15px] hover:opacity-70 transition-opacity hidden sm:block">Analytics</button>
                        <button onClick={handleLogout} className="podia-btn py-2 px-5 text-sm">Logout</button>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-10 px-6">
                {/* Header Section */}
                <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                    <div>
                        <h2 className="text-4xl font-black mb-2">Hello, {user?.name}</h2>
                        <p className="text-lg font-medium text-[#1f1d1d]/70">Manage your active classes and past sessions from your dashboard.</p>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => setActiveTab('active')} className={`font-bold px-6 py-3 rounded-full transition-all ${activeTab === 'active' ? 'bg-[#1f1d1d] text-white' : 'bg-[#e0dad2] text-[#1f1d1d] hover:bg-[#d4cfc8]'}`}>Live classes</button>
                        <button onClick={() => setActiveTab('history')} className={`font-bold px-6 py-3 rounded-full transition-all ${activeTab === 'history' ? 'bg-[#1f1d1d] text-white' : 'bg-[#e0dad2] text-[#1f1d1d] hover:bg-[#d4cfc8]'}`}>Past history</button>
                    </div>
                </div>

                {/* ===== ACTIVE TAB ===== */}
                {activeTab === 'active' && (
                    <>
                        <div className="flex flex-wrap gap-4 mb-8">
                            <button onClick={() => setShowNewSessionForm(!showNewSessionForm)} className="podia-btn bg-[#a1d1b6] text-[#1f1d1d] hover:bg-[#8cc4a3]">
                                <PlusCircle className="w-5 h-5 mr-2" /> Start New Class
                            </button>
                            {lastSubject && (
                                <button onClick={handleStartNextSession} disabled={creating} className="podia-btn-outline bg-white">
                                    <Zap className="w-5 h-5 mr-2" /> Quick start {lastSubject}
                                </button>
                            )}
                        </div>

                        <AnimatePresence>
                            {showNewSessionForm && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-10 overflow-hidden">
                                    <div className="podia-card-white p-8 rounded-[32px] border-2 border-[#e0dad2]">
                                        <h3 className="text-2xl font-black mb-6">Create a new class session</h3>
                                        <form onSubmit={handleCreateSession} className="flex flex-col md:flex-row items-end gap-6 text-left">
                                            <div className="w-full md:w-1/3">
                                                <label className="podia-label">Subject</label>
                                                {teacherSubjects.length > 0 ? (
                                                    <select value={newSubject} onChange={e => setNewSubject(e.target.value)} required className="podia-input">
                                                        <option value="" disabled>Select subject</option>
                                                        {teacherSubjects.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                                                    </select>
                                                ) : (
                                                    <input type="text" value={newSubject} onChange={e => setNewSubject(e.target.value)} required placeholder="e.g. Mathematics" className="podia-input" />
                                                )}
                                            </div>
                                            <div className="w-full md:w-1/4">
                                                <label className="podia-label">Duration (min)</label>
                                                <input type="number" min="5" max="180" value={newDuration} onChange={e => setNewDuration(e.target.value)} required className="podia-input" />
                                            </div>
                                            <div className="w-full md:w-1/4">
                                                <label className="podia-label">Total Students</label>
                                                <input type="number" min="1" max="500" value={newTotalStudents} onChange={e => setNewTotalStudents(e.target.value)} required className="podia-input" />
                                            </div>
                                            <div className="w-full md:w-auto">
                                                <button type="submit" disabled={creating} className="podia-btn w-full whitespace-nowrap">
                                                    {creating ? 'Creating...' : 'Launch Session'}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {activeSessions.length === 0 ? (
                                <div className="col-span-full py-20 text-center rounded-[32px] border-2 border-dashed border-[#e0dad2]">
                                    <Users className="w-12 h-12 mx-auto text-[#1f1d1d]/20 mb-4" />
                                    <h3 className="text-xl font-bold mb-2">No active classes</h3>
                                    <p className="font-medium text-[#1f1d1d]/60">Create a new session to display the QR code and track attendance.</p>
                                </div>
                            ) : (
                                activeSessions.map((session, i) => {
                                    const sessionId = session?.sessionId || session?._id || 'Unknown';
                                    const live = liveAttendance[sessionId] || { count: 0, totalStudents: session.totalStudents || 60, recent: [] };
                                    const isCode = !!session.classCode;

                                    return (
                                        <div key={sessionId} className="podia-card-white rounded-[32px] overflow-hidden flex flex-col">
                                            <div className="p-8 border-b-2 border-[#f0ebe1] flex flex-wrap gap-4 items-start justify-between bg-white">
                                                <div>
                                                    <h3 className="text-2xl font-black mb-1">{session.subject}</h3>
                                                    <span className="font-mono text-sm font-bold text-[#1f1d1d]/50">ID: {sessionId.slice(0, 8)}...</span>
                                                </div>
                                                <div className="bg-[#a1d1b6]/30 text-[#1f1d1d] font-bold px-4 py-2 rounded-full text-sm inline-flex items-center">
                                                    <span className="w-2 h-2 rounded-full bg-[#10b981] mr-2 animate-pulse"></span> Receiving attendance
                                                </div>
                                            </div>

                                            <div className="p-8 flex-1 grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-[#faf8f5]">
                                                {/* Left Column: QR and Expire */}
                                                <div className="flex flex-col items-center justify-center bg-white p-6 rounded-[24px] shadow-sm border border-[#f0ebe1]">
                                                    <div className="bg-white p-2 rounded-xl mb-6 shadow-sm border border-[#e0dad2]">
                                                        {renderQrCode(session)}
                                                    </div>
                                                    <CountdownTimer expiresAt={session?.expiresAt} />
                                                </div>

                                                {/* Right Column: Stats & Code */}
                                                <div className="flex flex-col gap-6">
                                                    <div className="bg-[#a6c5d4] rounded-[24px] p-6 text-[#1f1d1d]">
                                                        <p className="font-bold text-sm mb-1 opacity-80 uppercase tracking-wide">Present</p>
                                                        <div className="flex items-baseline gap-1">
                                                            <span className="text-4xl font-black">{live.count}</span>
                                                            <span className="text-lg font-bold opacity-60">/ {live.totalStudents}</span>
                                                        </div>
                                                        <div className="w-full bg-white/30 rounded-full h-2 mt-4">
                                                            <div className="bg-[#1f1d1d] h-2 rounded-full transition-all" style={{ width: `${Math.min(100, (live.count / live.totalStudents) * 100)}%` }}></div>
                                                        </div>
                                                    </div>

                                                    {isCode && (
                                                        <div className="bg-[#cdb4eb] rounded-[24px] p-6 font-mono relative overflow-hidden group">
                                                            <p className="font-bold text-sm mb-2 opacity-80 uppercase tracking-wide font-sans">Class Code</p>
                                                            <p className="text-4xl font-black tracking-widest">{session.classCode}</p>
                                                            <button onClick={() => copyClassCode(session.classCode)} className="absolute right-4 top-1/2 -translate-y-1/2 bg-[#1f1d1d] text-white p-3 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <Copy className="w-5 h-5" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="p-6 bg-white border-t-2 border-[#f0ebe1] flex flex-col sm:flex-row gap-4">
                                                <button onClick={() => handleExport(sessionId)} className="podia-btn-outline flex-1 border-2 border-[#1f1d1d] hover:bg-[#fdfaf6]">
                                                    <FileSpreadsheet className="w-4 h-4 mr-2" /> Export
                                                </button>
                                                <button onClick={() => handleEndSession(sessionId)} className="podia-btn flex-1 bg-[#ef4444] hover:bg-[#dc2626]">
                                                    <StopCircle className="w-4 h-4 mr-2" /> End class
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </>
                )}

                {/* ===== HISTORY TAB ===== */}
                {activeTab === 'history' && (
                    <>
                        {pastSessions.length === 0 ? (
                            <div className="py-20 text-center rounded-[32px] border-2 border-dashed border-[#e0dad2]">
                                <History className="w-12 h-12 mx-auto text-[#1f1d1d]/20 mb-4" />
                                <h3 className="text-xl font-bold mb-2">No history</h3>
                                <p className="font-medium text-[#1f1d1d]/60">Your past sessions will appear here.</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-6">
                                {pastSessions.map((session) => {
                                    const isExpanded = expandedSession === session.sessionId;
                                    const presentCount = session.presentCount || 0;
                                    const absentCount = session.absentCount || 0;
                                    const total = session.totalStudents || presentCount + absentCount || 1;
                                    const rate = Math.round((presentCount / total) * 100);

                                    return (
                                        <div key={session.sessionId} className="podia-card-white rounded-[32px] overflow-hidden border-2 border-transparent hover:border-[#e0dad2] transition-colors bg-white">
                                            <button onClick={() => setExpandedSession(isExpanded ? null : session.sessionId)} className="w-full text-left p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                                                <div>
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h3 className="text-2xl font-black">{session.subject}</h3>
                                                        <span className="bg-[#f0ebe1] text-sm font-bold px-3 py-1 rounded-full font-mono">{session.classCode || 'NO-CODE'}</span>
                                                    </div>
                                                    <p className="text-[15px] font-semibold text-[#1f1d1d]/60 flex items-center gap-2">
                                                        <Clock className="w-4 h-4" /> {formatDate(session.createdAt)} • {formatTime(session.createdAt)}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-6">
                                                    <div className="hidden md:flex gap-4">
                                                        <div className="text-center">
                                                            <div className="font-black text-2xl">{presentCount}</div>
                                                            <div className="text-xs font-bold uppercase tracking-wider text-[#1f1d1d]/50">Present</div>
                                                        </div>
                                                        <div className="text-center">
                                                            <div className="font-black text-2xl text-[#ef4444]">{absentCount}</div>
                                                            <div className="text-xs font-bold uppercase tracking-wider text-[#1f1d1d]/50 text-[#ef4444]">Absent</div>
                                                        </div>
                                                    </div>
                                                    <div className="w-12 h-12 bg-[#f0ebe1] rounded-full flex items-center justify-center transition-transform" style={{ transform: isExpanded ? 'rotate(180deg)' : 'none' }}>
                                                        <ChevronDown className="w-6 h-6" />
                                                    </div>
                                                </div>
                                            </button>

                                            <AnimatePresence>
                                                {isExpanded && (
                                                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                                                        <div className="p-6 sm:p-8 border-t-2 border-[#f0ebe1] bg-[#faf8f5]">
                                                            <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
                                                                <h4 className="text-xl font-black">Attendance Details</h4>
                                                                <button onClick={() => handleExport(session.sessionId)} className="podia-btn-outline py-2 px-6">
                                                                    <FileSpreadsheet className="w-4 h-4 mr-2" /> Download Excel
                                                                </button>
                                                            </div>

                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                                {/* Present List */}
                                                                <div className="bg-white rounded-[24px] p-6 border border-[#e0dad2] shadow-sm">
                                                                    <h5 className="font-bold flex items-center gap-2 mb-4">
                                                                        <CheckCircle className="w-5 h-5 text-[#10b981]" /> Present Students
                                                                    </h5>
                                                                    <div className="max-h-60 overflow-y-auto pr-2">
                                                                        {session.attendance?.filter(a => a.status === 'Present').map((s, idx) => (
                                                                            <div key={idx} className="flex justify-between items-center py-3 border-b border-[#f0ebe1] last:border-0">
                                                                                <div>
                                                                                    <div className="font-bold text-[15px]">{s.studentName}</div>
                                                                                    <div className="text-xs font-bold text-[#1f1d1d]/50 font-mono">{s.rollNo}</div>
                                                                                </div>
                                                                                <div className="text-sm font-semibold text-[#1f1d1d]/60">{s.time}</div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>

                                                                {/* Absent List */}
                                                                <div className="bg-white rounded-[24px] p-6 border border-[#e0dad2] shadow-sm">
                                                                    <h5 className="font-bold flex items-center gap-2 mb-4">
                                                                        <XCircle className="w-5 h-5 text-[#ef4444]" /> Absent Students
                                                                    </h5>
                                                                    <div className="max-h-60 overflow-y-auto pr-2">
                                                                        {session.attendance?.filter(a => a.status === 'Absent').map((s, idx) => (
                                                                            <div key={idx} className="flex justify-between items-center py-3 border-b border-[#f0ebe1] last:border-0">
                                                                                <div>
                                                                                    <div className="font-bold text-[15px]">{s.studentName}</div>
                                                                                    <div className="text-xs font-bold text-[#1f1d1d]/50 font-mono">{s.rollNo}</div>
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                        {(!session.attendance || session.attendance.filter(a => a.status === 'Absent').length === 0) && (
                                                                            <p className="text-sm font-semibold text-[#1f1d1d]/50">No absent students recorded.</p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}
