import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '@/utils/api';
import { ArrowLeft, BarChart3, Users, Award } from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell
} from 'recharts';

const COLORS = ['#a6c5d4', '#e6a356', '#cdb4eb', '#f2ce6e', '#a1d1b6', '#ffb6b9', '#bbded6', '#fae3d9'];

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-[#1f1d1d] text-white rounded-[16px] p-4 shadow-xl border-none">
                <p className="text-sm font-bold mb-2">{label}</p>
                {payload.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 mb-1 text-sm font-semibold">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                        {item.name}: {item.value}%
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

export default function AnalyticsDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user || user.role !== 'teacher') { navigate('/teacher/login'); return; }
        fetchAnalytics();
    }, [user, navigate]);

    const fetchAnalytics = async () => {
        try { const res = await api.get('/sessions/analytics'); setData(res.data); }
        catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-[#fdfaf6]">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#e0dad2] border-t-[#1f1d1d]"></div>
        </div>
    );

    const overall = data?.overall || {};
    const subjects = data?.subjects || [];
    const dailyTrend = data?.dailyTrend || [];

    const statCards = [
        { label: 'Total Sessions', value: overall.totalSessions || 0, color: 'podia-card-blue' },
        { label: 'Avg Attendance', value: `${overall.avgAttendance || 0}%`, color: 'podia-card-purple' },
        { label: 'Total Present', value: overall.totalPresent || 0, color: 'podia-card-green' },
        { label: 'Unique Subjects', value: subjects.length, color: 'podia-card-yellow' },
    ];

    return (
        <div className="min-h-screen bg-[#fdfaf6]">
            {/* Top Navigation */}
            <nav className="border-b-2 border-[#1f1d1d]/10 bg-white sticky top-0 z-50">
                <div className="flex items-center max-w-7xl mx-auto w-full px-6 py-4 justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate(-1)} className="p-2 bg-[#f0ebe1] rounded-full hover:bg-[#e0dad2] transition-colors">
                            <ArrowLeft className="w-5 h-5 text-[#1f1d1d]" />
                        </button>
                        <h1 className="text-xl font-black text-[#1f1d1d]">Analytics</h1>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-10 px-6 space-y-12">

                {/* Intro */}
                <div>
                    <h2 className="text-4xl font-black mb-2 text-[#1f1d1d]">Attendance Insights</h2>
                    <p className="text-lg font-medium text-[#1f1d1d]/70">High-level details regarding your classes and student engagement.</p>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {statCards.map((card, i) => (
                        <div key={card.label} className={`${card.color} rounded-[32px] p-8 shadow-sm flex flex-col justify-center`}>
                            <p className="text-sm font-bold opacity-80 uppercase tracking-wide mb-2">{card.label}</p>
                            <p className="text-5xl font-black">{card.value}</p>
                        </div>
                    ))}
                </div>

                {/* Charts Area */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Bar Chart */}
                    <div className="podia-card-white border-2 border-[#e0dad2] rounded-[32px] overflow-hidden flex flex-col">
                        <div className="p-8 border-b-2 border-[#f0ebe1] bg-[#faf8f5]">
                            <h3 className="text-2xl font-black flex items-center gap-3">
                                <BarChart3 className="w-6 h-6 opacity-60" /> Subject Averages
                            </h3>
                        </div>
                        <div className="p-8 flex-1 bg-white">
                            {subjects.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={subjects} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0ebe1" />
                                        <XAxis dataKey="name" tick={{ fontSize: 13, fill: '#1f1d1d', fontWeight: 600 }} axisLine={false} tickLine={false} dy={10} />
                                        <YAxis domain={[0, 100]} tick={{ fontSize: 13, fill: '#1f1d1d', fontWeight: 600 }} axisLine={false} tickLine={false} />
                                        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f0ebe1' }} />
                                        <Bar dataKey="percentage" name="Attendance" radius={[8, 8, 8, 8]} barSize={40}>
                                            {subjects.map((_, i) => (<Cell key={i} fill={COLORS[i % COLORS.length]} />))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-[#1f1d1d]/50 font-bold">No data available</div>
                            )}
                        </div>
                    </div>

                    {/* Pie Chart */}
                    <div className="podia-card-white border-2 border-[#e0dad2] rounded-[32px] overflow-hidden flex flex-col">
                        <div className="p-8 border-b-2 border-[#f0ebe1] bg-[#faf8f5]">
                            <h3 className="text-2xl font-black flex items-center gap-3">
                                <Award className="w-6 h-6 opacity-60" /> Total Distribution
                            </h3>
                        </div>
                        <div className="p-8 flex-1 bg-white flex items-center justify-center">
                            {subjects.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie data={subjects} dataKey="present" nameKey="name" cx="50%" cy="50%"
                                            outerRadius={120} innerRadius={60} paddingAngle={3} stroke="none"
                                            labelLine={false}
                                        >
                                            {subjects.map((_, i) => (<Cell key={i} fill={COLORS[i % COLORS.length]} />))}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip />} />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-[#1f1d1d]/50 font-bold">No data available</div>
                            )}
                        </div>
                    </div>

                    {/* Line Chart */}
                    <div className="podia-card-white border-2 border-[#e0dad2] rounded-[32px] overflow-hidden col-span-1 lg:col-span-2 flex flex-col">
                        <div className="p-8 border-b-2 border-[#f0ebe1] bg-[#faf8f5]">
                            <h3 className="text-2xl font-black flex items-center gap-3">
                                <Users className="w-6 h-6 opacity-60" /> Daily Trend
                            </h3>
                        </div>
                        <div className="p-8 bg-white">
                            {dailyTrend.length > 0 ? (
                                <ResponsiveContainer width="100%" height={350}>
                                    <LineChart data={dailyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0ebe1" />
                                        <XAxis dataKey="date" tick={{ fontSize: 13, fill: '#1f1d1d', fontWeight: 600 }} axisLine={false} tickLine={false} dy={10} />
                                        <YAxis domain={[0, 100]} tick={{ fontSize: 13, fill: '#1f1d1d', fontWeight: 600 }} axisLine={false} tickLine={false} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Line type="monotone" dataKey="percentage" stroke="#1f1d1d" strokeWidth={4}
                                            dot={{ r: 6, fill: '#1f1d1d', strokeWidth: 0 }} activeDot={{ r: 8, fill: '#e6a356', strokeWidth: 0 }} name="Attendance" />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-64 flex items-center justify-center text-[#1f1d1d]/50 font-bold">No trend data available</div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
