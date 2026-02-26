import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '@/utils/api';
import { useAuth } from '@/context/AuthContext';

export default function Login({ type }) {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [formData, setFormData] = useState({});
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const isTeacher = type === 'teacher';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const endpoint = isTeacher ? '/auth/teacher/login' : '/auth/student/login';
            const response = await api.post(endpoint, formData);
            const { token, teacher, student } = response.data;
            const userData = isTeacher ? teacher : student;
            login(token, { ...userData, role: type });
            navigate(`/${type}/dashboard`);
        } catch (err) {
            setError(err.response?.data?.error || 'Invalid credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#fdfaf6] flex flex-col justify-center px-4 relative overflow-hidden">
            {/* Shapes */}
            <div className="absolute bottom-10 left-[10%] w-24 h-24 bg-[#a6c5d4] rounded-full hidden md:block"></div>
            <div className="absolute top-20 right-[15%] w-20 h-20 bg-[#e6a356] rounded-[24px] rotate-12 hidden md:block"></div>
            <div className="absolute bottom-1/4 right-[25%] w-16 h-16 bg-[#cdb4eb] hidden md:block" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}></div>

            <div className="absolute top-6 left-6 z-20">
                <Link to="/" className="text-2xl font-black tracking-tighter text-[#1f1d1d] hover:opacity-80 transition-opacity">SmartAttend</Link>
            </div>

            <div className="w-full max-w-md mx-auto podia-card-white rounded-[32px] p-8 sm:p-12 relative z-10">
                <h2 className="text-3xl font-black text-[#1f1d1d] mb-2">{isTeacher ? 'Teacher' : 'Student'} Login</h2>
                <p className="text-[15px] font-semibold text-[#1f1d1d]/70 mb-8">Enter your details to access your portal</p>

                <form className="space-y-5" onSubmit={handleSubmit}>
                    <div>
                        <label className="podia-label">{isTeacher ? 'Teacher ID' : 'Roll Number'}</label>
                        <input name={isTeacher ? 'teacherId' : 'rollNo'} type="text" required onChange={e => setFormData({ ...formData, [e.target.name]: e.target.value })} className="podia-input" />
                    </div>
                    <div>
                        <label className="podia-label">Password</label>
                        <input name="password" type="password" required onChange={e => setFormData({ ...formData, password: e.target.value })} className="podia-input" />
                    </div>

                    {error && <div className="text-[#ef4444] bg-[#fef2f2] p-4 rounded-[16px] border-2 border-[#fecaca] text-[15px] font-bold">{error}</div>}

                    <button type="submit" disabled={loading} className="podia-btn w-full text-lg mt-2 font-bold py-4">
                        {loading ? 'Logging in...' : 'Log in'}
                    </button>

                    <div className="text-center mt-6">
                        <p className="text-[15px] font-semibold text-[#1f1d1d]/80">
                            Don't have an account? <Link to={`/${type}/register`} className="text-[#1f1d1d] underline decoration-2 underline-offset-4 hover:opacity-70 transition-opacity ml-1">Sign up</Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}
