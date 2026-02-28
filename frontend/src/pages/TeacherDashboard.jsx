import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '@/utils/api';
import socket from '@/utils/socket';
import { PlusCircle, StopCircle, FileSpreadsheet, BarChart3, Copy, Users, Zap, History, ChevronDown, Clock, XCircle, CheckCircle, Eye, EyeOff, UserPlus, Trash2 } from 'lucide-react';
import QRCode from 'react-qr-code';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

/* ─── Countdown Timer ─── */
function CountdownTimer({ expiresAt }) {
    const [timeLeft, setTimeLeft] = useState(0);
    const [totalTime, setTotalTime] = useState(0);

    useEffect(() => {
        if (!expiresAt) return;
        const expires = new Date(expiresAt).getTime();
        const total = Math.max(0, Math.floor((expires - Date.now()) / 1000));
        setTotalTime(total); setTimeLeft(total);
        const iv = setInterval(() => {
            const r = Math.max(0, Math.floor((expires - Date.now()) / 1000));
            setTimeLeft(r); if (r <= 0) clearInterval(iv);
        }, 1000);
        return () => clearInterval(iv);
    }, [expiresAt]);

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const progress = totalTime > 0 ? timeLeft / totalTime : 0;
    const isExpiring = timeLeft < 60;
    const isExpired = timeLeft <= 0;

    return (
        <div className="flex flex-col items-center gap-1 w-full">
            <div className="w-full bg-[#e0dad2] rounded-full h-2.5 max-w-[160px] overflow-hidden">
                <div className={`h-full transition-all duration-1000 ease-linear ${isExpired ? 'bg-[#ef4444]' : isExpiring ? 'bg-[#e6a356]' : 'bg-[#1f1d1d]'}`}
                    style={{ width: `${progress * 100}%` }}></div>
            </div>
            <span className={`text-lg font-bold font-mono mt-1 ${isExpired ? 'text-[#ef4444]' : isExpiring ? 'text-[#e6a356]' : 'text-[#1f1d1d]'}`}>
                {isExpired ? 'EXPIRED' : `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`}
            </span>
            <span className="text-xs font-semibold text-[#1f1d1d]/60">{isExpired ? 'Session ended' : 'Time remaining'}</span>
        </div>
    );
}

/* ─── Student Roster Form ─── */
function StudentRosterPanel({ onSave, initial = [] }) {
    const [year, setYear] = useState('');
    const [dept, setDept] = useState('');
    const [stream, setStream] = useState('');
    const [students, setStudents] = useState(initial);
    const [newName, setNewName] = useState('');
    const [newRoll, setNewRoll] = useState('');

    const addStudent = () => {
        if (!newName.trim() || !newRoll.trim()) { toast.error('Enter both name and roll no'); return; }
        if (students.find(s => s.rollNo === newRoll.trim())) { toast.error('Roll number already added'); return; }
        setStudents(prev => [...prev, { name: newName.trim(), rollNo: newRoll.trim() }]);
        setNewName(''); setNewRoll('');
    };

    const removeStudent = (roll) => setStudents(prev => prev.filter(s => s.rollNo !== roll));

    const handleSave = () => {
        if (students.length === 0) { toast.error('Add at least one student'); return; }
        onSave({ year, dept, stream, students });
    };

    return (
        <div className="space-y-5">
            {/* Class Meta */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                    <label className="podia-label">Year</label>
                    <select value={year} onChange={e => setYear(e.target.value)} className="podia-input">
                        <option value="">Select year</option>
                        {[1, 2, 3, 4].map(y => <option key={y} value={y}>Year {y}</option>)}
                    </select>
                </div>
                <div>
                    <label className="podia-label">Department</label>
                    <input type="text" value={dept} onChange={e => setDept(e.target.value)} placeholder="e.g. CSE" className="podia-input" />
                </div>
                <div>
                    <label className="podia-label">Stream / Section</label>
                    <input type="text" value={stream} onChange={e => setStream(e.target.value)} placeholder="e.g. A" className="podia-input" />
                </div>
            </div>

            {/* Add Student Row */}
            <div className="flex flex-col sm:flex-row gap-3 items-end">
                <div className="flex-1">
                    <label className="podia-label">Student Name</label>
                    <input type="text" value={newName} onChange={e => setNewName(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && addStudent()}
                        placeholder="Full name" className="podia-input" />
                </div>
                <div className="w-full sm:w-40">
                    <label className="podia-label">Roll No.</label>
                    <input type="text" value={newRoll} onChange={e => setNewRoll(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && addStudent()}
                        placeholder="e.g. CS2401" className="podia-input" />
                </div>
                <button onClick={addStudent} className="podia-btn bg-[#a1d1b6] text-[#1f1d1d] hover:bg-[#8cc4a3] h-12 px-5 shrink-0">
                    <UserPlus className="w-4 h-4 mr-1" /> Add
                </button>
            </div>

            {/* Student List */}
            {students.length > 0 && (
                <div className="bg-[#faf8f5] rounded-[18px] border border-[#e0dad2] overflow-hidden">
                    <div className="px-5 py-3 border-b border-[#e0dad2] flex justify-between text-xs font-bold uppercase tracking-wider text-[#1f1d1d]/50">
                        <span>Name</span><span className="flex items-center gap-8"><span>Roll No.</span><span>Remove</span></span>
                    </div>
                    <div className="max-h-48 overflow-y-auto divide-y divide-[#f0ebe1]">
                        {students.map((s, i) => (
                            <div key={i} className="flex items-center justify-between px-5 py-3">
                                <span className="font-bold text-sm">{s.name}</span>
                                <div className="flex items-center gap-4">
                                    <span className="font-mono text-sm text-[#1f1d1d]/60">{s.rollNo}</span>
                                    <button onClick={() => removeStudent(s.rollNo)} className="text-[#ef4444] hover:opacity-70">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between pt-2">
                <span className="text-sm font-semibold text-[#1f1d1d]/60">{students.length} student{students.length !== 1 ? 's' : ''} added</span>
                <button onClick={handleSave} className="podia-btn px-7">
                    Save Roster &amp; Continue
                </button>
            </div>
        </div>
    );
}

/* ─── Manual Attendance Panel ─── */
function ManualAttendancePanel({ sessionId }) {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState('');
    const [roll, setRoll] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleManualMark = async () => {
        if (!name.trim() || !roll.trim()) { toast.error('Enter both name and roll number'); return; }
        setSubmitting(true);
        try {
            const res = await api.post('/attendance/manual-mark', { sessionId, studentName: name.trim(), rollNo: roll.trim() });
            if (res.data.alreadyMarked) {
                toast.info(res.data.message);
            } else {
                toast.success(res.data.message);
            }
            setName(''); setRoll('');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to mark');
        } finally { setSubmitting(false); }
    };

    return (
        <div className="border-t-2 border-[#f0ebe1] bg-[#faf8f5]">
            <button onClick={() => setOpen(!open)}
                className="w-full px-5 sm:px-8 py-4 flex items-center justify-between text-left hover:bg-[#f0ebe1]/50 transition-colors">
                <div className="flex items-center gap-2 font-bold text-sm sm:text-base">
                    <UserPlus className="w-4 h-4" />
                    <span>Manual Attendance</span>
                    <span className="text-[#1f1d1d]/50 font-normal text-xs sm:text-sm">(for students without phone)</span>
                </div>
                <ChevronDown className={`w-5 h-5 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
                {open && (
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                        <div className="px-5 sm:px-8 pb-5 flex flex-col sm:flex-row gap-3 items-end">
                            <div className="flex-1 w-full">
                                <label className="podia-label">Student Name</label>
                                <input type="text" value={name} onChange={e => setName(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleManualMark()}
                                    placeholder="e.g. Rahul Kumar" className="podia-input" />
                            </div>
                            <div className="w-full sm:w-40">
                                <label className="podia-label">Roll No.</label>
                                <input type="text" value={roll} onChange={e => setRoll(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleManualMark()}
                                    placeholder="e.g. CS2401" className="podia-input" />
                            </div>
                            <button onClick={handleManualMark} disabled={submitting}
                                className="podia-btn bg-[#a1d1b6] text-[#1f1d1d] hover:bg-[#8cc4a3] h-12 px-5 shrink-0 w-full sm:w-auto">
                                {submitting ? 'Adding...' : <><UserPlus className="w-4 h-4 mr-1" /> Mark Present</>}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

/* ─── Main Dashboard ─── */
export default function TeacherDashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [activeSessions, setActiveSessions] = useState([]);
    const [pastSessions, setPastSessions] = useState([]);
    const [expandedSession, setExpandedSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('active');

    const [showNewSessionForm, setShowNewSessionForm] = useState(false);
    const [formStep, setFormStep] = useState('session'); // 'session' | 'roster'
    const [newSubject, setNewSubject] = useState('');
    const [newDuration, setNewDuration] = useState(60);
    const [newTotalStudents, setNewTotalStudents] = useState(60);
    const [pendingRoster, setPendingRoster] = useState(null);  // roster saved before session create
    const [creating, setCreating] = useState(false);
    const [lastSubject, setLastSubject] = useState('');
    const [liveAttendance, setLiveAttendance] = useState({});
    const [maskedCodes, setMaskedCodes] = useState({}); // sessionId -> bool (true = hidden)

    const teacherSubjects = Array.isArray(user?.subjects)
        ? user.subjects.map(s => String(s).trim()).filter(Boolean) : [];

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
        socket.on('sessionEnded', () => { fetchSessions(); fetchHistory(); });
        return () => { socket.off('attendanceMarked'); socket.off('sessionEnded'); socket.disconnect(); };
    }, []);

    useEffect(() => { activeSessions.forEach(s => socket.emit('joinSession', s.sessionId)); }, [activeSessions]);

    const fetchSessions = async () => {
        try {
            const res = await api.get('/sessions');
            const sessions = Array.isArray(res.data) ? res.data : [];
            setActiveSessions(sessions);
            // Init code masking – masked by default
            setMaskedCodes(prev => {
                const next = { ...prev };
                sessions.forEach(s => { if (!(s.sessionId in next)) next[s.sessionId] = true; });
                return next;
            });
            for (const session of sessions) {
                try {
                    const attRes = await api.get(`/attendance/session/${session.sessionId}`);
                    const records = Array.isArray(attRes.data) ? attRes.data : [];
                    const presentRecords = records.filter(r => r.status === 'Present');
                    setLiveAttendance(prev => ({
                        ...prev, [session.sessionId]: {
                            count: presentRecords.length, totalStudents: session.totalStudents || 60,
                            recent: presentRecords.slice(0, 5).map(r => ({ name: r.rollNo, rollNo: r.rollNo }))
                        }
                    }));
                } catch { }
            }
        } catch { setActiveSessions([]); }
        finally { setLoading(false); }
    };

    const fetchHistory = async () => {
        try { const res = await api.get('/sessions/history'); setPastSessions(Array.isArray(res.data) ? res.data : []); } catch { }
    };

    const handleLogout = () => { logout(); navigate('/'); };

    const handleRosterSaved = (roster) => { setPendingRoster(roster); setFormStep('session'); };

    const handleCreateSession = async (e) => {
        e.preventDefault(); setCreating(true);
        try {
            const subjectToUse = newSubject || teacherSubjects[0] || 'General';
            const payload = {
                subject: subjectToUse,
                durationMinutes: Number(newDuration),
                totalStudents: pendingRoster?.students?.length || Number(newTotalStudents),
                ...(pendingRoster ? { roster: pendingRoster } : {})
            };
            await api.post('/sessions', payload);
            setLastSubject(subjectToUse); setNewSubject(''); setNewDuration(60);
            setPendingRoster(null); setShowNewSessionForm(false); setFormStep('session');
            toast.success('Session created!'); await fetchSessions();
        } catch { toast.error('Failed to create session'); }
        finally { setCreating(false); }
    };

    const handleStartNextSession = async () => {
        if (!lastSubject) { setShowNewSessionForm(true); return; }
        setCreating(true);
        try { await api.post('/sessions', { subject: lastSubject, durationMinutes: 60, totalStudents: Number(newTotalStudents) }); toast.success('Quick session started!'); await fetchSessions(); }
        catch { toast.error('Failed'); } finally { setCreating(false); }
    };

    const handleEndSession = async (sessionId) => {
        if (!window.confirm('Are you sure you want to end this session?')) return;
        try { await api.put(`/sessions/${sessionId}/end`); toast.success('Session ended.'); fetchSessions(); fetchHistory(); }
        catch { toast.error('Failed'); }
    };

    const handleExport = async (sessionId) => {
        try {
            const res = await api.get(`/attendance/export/${sessionId}`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const a = document.createElement('a'); a.href = url; a.download = `attendance_${sessionId}.xlsx`;
            document.body.appendChild(a); a.click(); a.remove(); toast.success('Exported!');
        } catch { toast.error('Export failed'); }
    };

    const copyCode = (code) => { navigator.clipboard.writeText(code); toast.success('Copied!'); };
    const toggleMask = (id) => setMaskedCodes(prev => ({ ...prev, [id]: !prev[id] }));

    const renderQr = (session) => {
        const qrValue = session?.qrData || session?.qrCode;
        if (!qrValue) return null;
        const v = String(qrValue).trim();
        if (v.startsWith('data:image') || v.length > 2000)
            return <img src={v.startsWith('data:image') ? v : `data:image/png;base64,${v}`} alt="QR" className="w-36 h-36 sm:w-40 sm:h-40" />;
        return <QRCode value={v} size={160} level="H" />;
    };

    const fmtDate = d => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A';
    const fmtTime = d => d ? new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '';

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-[#fdfaf6]">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#e0dad2] border-t-[#1f1d1d]"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#fdfaf6]">
            {/* Nav */}
            <nav className="border-b-2 border-[#1f1d1d]/10 bg-white sticky top-0 z-50">
                <div className="flex items-center max-w-7xl mx-auto w-full px-4 sm:px-6 py-3 sm:py-4 justify-between">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <h1 className="text-lg sm:text-xl font-black">SmartAttend</h1>
                        <span className="bg-[#a6c5d4] text-[#1f1d1d] text-xs font-bold px-2.5 py-1 rounded-full hidden sm:block">Teacher</span>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4">
                        <button onClick={() => navigate('/teacher/analytics')} className="font-bold text-sm sm:text-[15px] hover:opacity-70 transition-opacity hidden sm:block">Analytics</button>
                        <button onClick={handleLogout} className="podia-btn py-2 px-4 sm:px-5 text-sm">Logout</button>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-6 sm:py-10 px-4 sm:px-6">
                {/* Header */}
                <div className="mb-8 sm:mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-6">
                    <div>
                        <h2 className="text-3xl sm:text-4xl font-black mb-1 sm:mb-2">Hello, {user?.name}</h2>
                        <p className="text-base sm:text-lg font-medium text-[#1f1d1d]/70">Manage your active classes and past sessions.</p>
                    </div>
                    <div className="flex gap-2 sm:gap-3 flex-wrap">
                        <button onClick={() => setActiveTab('active')} className={`font-bold px-4 sm:px-6 py-2.5 sm:py-3 rounded-full transition-all text-sm sm:text-base ${activeTab === 'active' ? 'bg-[#1f1d1d] text-white' : 'bg-[#e0dad2] text-[#1f1d1d] hover:bg-[#d4cfc8]'}`}>Live classes</button>
                        <button onClick={() => setActiveTab('history')} className={`font-bold px-4 sm:px-6 py-2.5 sm:py-3 rounded-full transition-all text-sm sm:text-base ${activeTab === 'history' ? 'bg-[#1f1d1d] text-white' : 'bg-[#e0dad2] text-[#1f1d1d] hover:bg-[#d4cfc8]'}`}>Past history</button>
                    </div>
                </div>

                {/* ===== ACTIVE TAB ===== */}
                {activeTab === 'active' && (
                    <>
                        <div className="flex flex-wrap gap-3 mb-6 sm:mb-8">
                            <button onClick={() => { setShowNewSessionForm(!showNewSessionForm); setFormStep('session'); }} className="podia-btn bg-[#a1d1b6] text-[#1f1d1d] hover:bg-[#8cc4a3] text-sm sm:text-base">
                                <PlusCircle className="w-4 h-4 mr-2" /> Start New Class
                            </button>
                            {lastSubject && (
                                <button onClick={handleStartNextSession} disabled={creating} className="podia-btn-outline bg-white text-sm sm:text-base">
                                    <Zap className="w-4 h-4 mr-2" /> Quick start {lastSubject}
                                </button>
                            )}
                        </div>

                        <AnimatePresence>
                            {showNewSessionForm && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-8 sm:mb-10 overflow-hidden">
                                    <div className="podia-card-white p-6 sm:p-8 rounded-[24px] sm:rounded-[32px] border-2 border-[#e0dad2]">
                                        {/* Step tabs */}
                                        <div className="flex gap-4 mb-6 border-b-2 border-[#f0ebe1]">
                                            <button onClick={() => setFormStep('session')} className={`pb-3 font-bold text-sm sm:text-base border-b-2 -mb-[2px] transition-colors ${formStep === 'session' ? 'border-[#1f1d1d] text-[#1f1d1d]' : 'border-transparent text-[#1f1d1d]/50'}`}>
                                                1. Session Details
                                            </button>
                                            <button onClick={() => setFormStep('roster')} className={`pb-3 font-bold text-sm sm:text-base border-b-2 -mb-[2px] transition-colors ${formStep === 'roster' ? 'border-[#1f1d1d] text-[#1f1d1d]' : 'border-transparent text-[#1f1d1d]/50'}`}>
                                                2. Student Roster {pendingRoster ? `(${pendingRoster.students.length})` : '(optional)'}
                                            </button>
                                        </div>

                                        {formStep === 'session' && (
                                            <>
                                                <h3 className="text-xl sm:text-2xl font-black mb-5">Create a new class session</h3>
                                                <form onSubmit={handleCreateSession} className="flex flex-col md:flex-row items-end gap-4 sm:gap-6 text-left">
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
                                                    <div className="w-full md:w-1/5">
                                                        <label className="podia-label">Duration (min)</label>
                                                        <input type="number" min="5" max="180" value={newDuration} onChange={e => setNewDuration(e.target.value)} required className="podia-input" />
                                                    </div>
                                                    <div className="w-full md:w-1/5">
                                                        <label className="podia-label">Total Students</label>
                                                        <input type="number" min="1" max="500" value={pendingRoster?.students?.length || newTotalStudents}
                                                            onChange={e => setNewTotalStudents(e.target.value)}
                                                            disabled={!!pendingRoster}
                                                            className="podia-input disabled:opacity-60" />
                                                    </div>
                                                    <div className="w-full md:w-auto">
                                                        <button type="submit" disabled={creating} className="podia-btn w-full whitespace-nowrap">
                                                            {creating ? 'Creating...' : 'Launch Session'}
                                                        </button>
                                                    </div>
                                                </form>
                                                {pendingRoster && (
                                                    <p className="mt-4 text-sm font-semibold text-[#1f1d1d]/70">
                                                        ✓ Roster ready — {pendingRoster.students.length} students, Year {pendingRoster.year} {pendingRoster.dept} {pendingRoster.stream}
                                                    </p>
                                                )}
                                            </>
                                        )}

                                        {formStep === 'roster' && (
                                            <>
                                                <h3 className="text-xl sm:text-2xl font-black mb-5">Add Student Roster</h3>
                                                <StudentRosterPanel onSave={handleRosterSaved} initial={pendingRoster?.students || []} />
                                            </>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                            {activeSessions.length === 0 ? (
                                <div className="col-span-full py-16 sm:py-20 text-center rounded-[24px] sm:rounded-[32px] border-2 border-dashed border-[#e0dad2]">
                                    <Users className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-[#1f1d1d]/20 mb-4" />
                                    <h3 className="text-lg sm:text-xl font-bold mb-2">No active classes</h3>
                                    <p className="font-medium text-[#1f1d1d]/60 text-sm sm:text-base">Create a new session to display the QR code and track attendance.</p>
                                </div>
                            ) : activeSessions.map(session => {
                                const sid = session?.sessionId || session?._id || 'Unknown';
                                const live = liveAttendance[sid] || { count: 0, totalStudents: session.totalStudents || 60, recent: [] };
                                const isCode = !!session.classCode;
                                const masked = maskedCodes[sid] !== false; // default masked

                                return (
                                    <div key={sid} className="podia-card-white rounded-[24px] sm:rounded-[32px] overflow-hidden flex flex-col">
                                        <div className="p-5 sm:p-8 border-b-2 border-[#f0ebe1] flex flex-wrap gap-3 items-start justify-between bg-white">
                                            <div>
                                                <h3 className="text-xl sm:text-2xl font-black mb-1">{session.subject}</h3>
                                                <span className="font-mono text-xs sm:text-sm font-bold text-[#1f1d1d]/50">ID: {sid.slice(0, 8)}...</span>
                                            </div>
                                            <div className="bg-[#a1d1b6]/30 text-[#1f1d1d] font-bold px-3 py-1.5 rounded-full text-xs sm:text-sm inline-flex items-center">
                                                <span className="w-2 h-2 rounded-full bg-[#10b981] mr-2 animate-pulse"></span> Receiving
                                            </div>
                                        </div>

                                        <div className="p-5 sm:p-8 flex-1 grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8 items-start bg-[#faf8f5]">
                                            {/* QR + Timer */}
                                            <div className="flex flex-col items-center bg-white p-5 rounded-[18px] sm:rounded-[24px] shadow-sm border border-[#f0ebe1]">
                                                <div className="bg-white p-2 rounded-xl mb-4 shadow-sm border border-[#e0dad2]">
                                                    {renderQr(session)}
                                                </div>
                                                <CountdownTimer expiresAt={session?.expiresAt} />
                                            </div>

                                            {/* Stats + Code */}
                                            <div className="flex flex-col gap-4">
                                                <div className="bg-[#a6c5d4] rounded-[18px] sm:rounded-[24px] p-5">
                                                    <p className="font-bold text-xs mb-1 opacity-80 uppercase tracking-wide">Present</p>
                                                    <div className="flex items-baseline gap-1 mb-3">
                                                        <span className="text-3xl sm:text-4xl font-black">{live.count}</span>
                                                        <span className="text-base sm:text-lg font-bold opacity-60">/ {live.totalStudents}</span>
                                                    </div>
                                                    <div className="w-full bg-white/30 rounded-full h-2">
                                                        <div className="bg-[#1f1d1d] h-2 rounded-full transition-all" style={{ width: `${Math.min(100, (live.count / live.totalStudents) * 100)}%` }}></div>
                                                    </div>
                                                </div>

                                                {isCode && (
                                                    <div className="bg-[#cdb4eb] rounded-[18px] sm:rounded-[24px] p-5 font-mono">
                                                        <div className="flex justify-between items-center mb-2">
                                                            <p className="font-bold text-xs opacity-80 uppercase tracking-wide font-sans">Class Code</p>
                                                            <div className="flex gap-2">
                                                                <button onClick={() => toggleMask(sid)} className="bg-[#1f1d1d]/10 hover:bg-[#1f1d1d]/20 p-1.5 rounded-lg transition-colors" title={masked ? 'Show code' : 'Hide code'}>
                                                                    {masked ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                                                </button>
                                                                <button onClick={() => copyCode(session.classCode)} className="bg-[#1f1d1d]/10 hover:bg-[#1f1d1d]/20 p-1.5 rounded-lg transition-colors" title="Copy code">
                                                                    <Copy className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <p className="text-3xl sm:text-4xl font-black tracking-widest">
                                                            {masked ? '• • • • • •' : session.classCode}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Manual Attendance Section */}
                                        <ManualAttendancePanel sessionId={sid} />

                                        <div className="p-4 sm:p-6 bg-white border-t-2 border-[#f0ebe1] flex flex-col sm:flex-row gap-3">
                                            <button onClick={() => handleExport(sid)} className="podia-btn-outline flex-1 text-sm">
                                                <FileSpreadsheet className="w-4 h-4 mr-2" /> Export
                                            </button>
                                            <button onClick={() => handleEndSession(sid)} className="podia-btn flex-1 bg-[#ef4444] hover:bg-[#dc2626] text-sm">
                                                <StopCircle className="w-4 h-4 mr-2" /> End class
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}

                {/* ===== HISTORY TAB ===== */}
                {activeTab === 'history' && (
                    <>
                        {pastSessions.length === 0 ? (
                            <div className="py-16 sm:py-20 text-center rounded-[24px] sm:rounded-[32px] border-2 border-dashed border-[#e0dad2]">
                                <History className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-[#1f1d1d]/20 mb-4" />
                                <h3 className="text-lg sm:text-xl font-bold mb-2">No history</h3>
                                <p className="font-medium text-[#1f1d1d]/60 text-sm sm:text-base">Your past sessions will appear here.</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4 sm:gap-6">
                                {pastSessions.map(session => {
                                    const isExpanded = expandedSession === session.sessionId;
                                    const presentCount = session.presentCount || 0;
                                    const absentCount = session.absentCount || 0;

                                    return (
                                        <div key={session.sessionId} className="podia-card-white rounded-[24px] sm:rounded-[32px] overflow-hidden border-2 border-transparent hover:border-[#e0dad2] transition-colors bg-white">
                                            <button onClick={() => setExpandedSession(isExpanded ? null : session.sessionId)}
                                                className="w-full text-left p-5 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
                                                <div>
                                                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                                                        <h3 className="text-xl sm:text-2xl font-black">{session.subject}</h3>
                                                        <span className="bg-[#f0ebe1] text-xs sm:text-sm font-bold px-2.5 py-1 rounded-full font-mono">{session.classCode || 'NO-CODE'}</span>
                                                    </div>
                                                    <p className="text-sm sm:text-[15px] font-semibold text-[#1f1d1d]/60 flex items-center gap-2">
                                                        <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> {fmtDate(session.createdAt)} • {fmtTime(session.createdAt)}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-4 sm:gap-6">
                                                    <div className="flex gap-4">
                                                        <div className="text-center">
                                                            <div className="font-black text-xl sm:text-2xl">{presentCount}</div>
                                                            <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#1f1d1d]/50">Present</div>
                                                        </div>
                                                        <div className="text-center">
                                                            <div className="font-black text-xl sm:text-2xl text-[#ef4444]">{absentCount}</div>
                                                            <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#ef4444]">Absent</div>
                                                        </div>
                                                    </div>
                                                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#f0ebe1] rounded-full flex items-center justify-center shrink-0" style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                                                        <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6" />
                                                    </div>
                                                </div>
                                            </button>

                                            <AnimatePresence>
                                                {isExpanded && (
                                                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                                                        <div className="p-5 sm:p-8 border-t-2 border-[#f0ebe1] bg-[#faf8f5]">
                                                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
                                                                <h4 className="text-lg sm:text-xl font-black">Attendance Details</h4>
                                                                <button onClick={() => handleExport(session.sessionId)} className="podia-btn-outline py-2 px-5 text-sm">
                                                                    <FileSpreadsheet className="w-4 h-4 mr-2" /> Download Excel
                                                                </button>
                                                            </div>

                                                            {/* Session meta */}
                                                            {session.roster && (
                                                                <div className="mb-6 bg-[#f0ebe1] rounded-[16px] p-4 flex flex-wrap gap-4 text-sm font-semibold">
                                                                    {session.roster.year && <span>📅 Year {session.roster.year}</span>}
                                                                    {session.roster.dept && <span>🏫 {session.roster.dept}</span>}
                                                                    {session.roster.stream && <span>📋 Section {session.roster.stream}</span>}
                                                                </div>
                                                            )}

                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8">
                                                                {/* Present */}
                                                                <div className="bg-white rounded-[18px] sm:rounded-[24px] p-5 sm:p-6 border border-[#e0dad2] shadow-sm">
                                                                    <h5 className="font-bold flex items-center gap-2 mb-4 text-sm sm:text-base">
                                                                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-[#10b981]" /> Present Students
                                                                    </h5>
                                                                    <div className="max-h-56 overflow-y-auto pr-1 space-y-1">
                                                                        {session.attendance?.filter(a => a.status === 'Present').map((s, i) => (
                                                                            <div key={i} className="flex justify-between items-center py-2.5 border-b border-[#f0ebe1] last:border-0">
                                                                                <div>
                                                                                    <div className="font-bold text-sm sm:text-[15px]">{s.studentName}</div>
                                                                                    <div className="text-[11px] sm:text-xs font-bold text-[#1f1d1d]/50 font-mono">{s.rollNo}</div>
                                                                                </div>
                                                                                <div className="text-xs sm:text-sm font-semibold text-[#1f1d1d]/60">{s.time}</div>
                                                                            </div>
                                                                        ))}
                                                                        {!session.attendance?.filter(a => a.status === 'Present').length && (
                                                                            <p className="text-sm font-semibold text-[#1f1d1d]/50 py-2">No present students.</p>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                {/* Absent */}
                                                                <div className="bg-white rounded-[18px] sm:rounded-[24px] p-5 sm:p-6 border border-[#e0dad2] shadow-sm">
                                                                    <h5 className="font-bold flex items-center gap-2 mb-4 text-sm sm:text-base">
                                                                        <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-[#ef4444]" /> Absent Students
                                                                    </h5>
                                                                    <div className="max-h-56 overflow-y-auto pr-1 space-y-1">
                                                                        {session.attendance?.filter(a => a.status === 'Absent').map((s, i) => (
                                                                            <div key={i} className="flex justify-between items-center py-2.5 border-b border-[#f0ebe1] last:border-0">
                                                                                <div>
                                                                                    <div className="font-bold text-sm sm:text-[15px]">{s.studentName}</div>
                                                                                    <div className="text-[11px] sm:text-xs font-bold text-[#1f1d1d]/50 font-mono">{s.rollNo}</div>
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                        {!session.attendance?.filter(a => a.status === 'Absent').length && (
                                                                            <p className="text-sm font-semibold text-[#1f1d1d]/50 py-2">No absent students recorded.</p>
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
