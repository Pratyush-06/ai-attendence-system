import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '@/utils/api';

export default function Register({ type }) {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({});
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const isTeacher = type === 'teacher';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const endpoint = isTeacher ? '/auth/teacher/register' : '/auth/student/register';
            const payload = { ...formData };
            if (isTeacher && payload.subjects) {
                payload.subjects = payload.subjects.split(',').map(s => s.trim()).filter(Boolean);
            }
            await api.post(endpoint, payload);
            navigate(`/${type}/login`);
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#fdfaf6] flex flex-col justify-center px-4 relative overflow-hidden py-12">
            {/* Shapes */}
            <div className="absolute top-10 left-[10%] w-24 h-24 bg-[#cdb4eb] rounded-full hidden md:block"></div>
            <div className="absolute bottom-20 right-[15%] w-20 h-20 bg-[#e6a356] rounded-[24px] -rotate-12 hidden md:block"></div>

            <div className="absolute top-6 left-6 z-20">
                <Link to="/" className="text-2xl font-black tracking-tighter text-[#1f1d1d] hover:opacity-80 transition-opacity">SmartAttend</Link>
            </div>

            <div className="w-full max-w-[500px] mx-auto podia-card-white rounded-[32px] p-8 sm:p-12 relative z-10">
                <h2 className="text-3xl font-black text-[#1f1d1d] mb-2">Create Account</h2>
                <p className="text-[15px] font-semibold text-[#1f1d1d]/70 mb-8">Register as a {isTeacher ? 'Teacher' : 'Student'} to get started</p>

                <form className="space-y-5" onSubmit={handleSubmit}>
                    <div>
                        <label className="podia-label">Full Name</label>
                        <input name="name" type="text" required onChange={e => setFormData({ ...formData, [e.target.name]: e.target.value })} className="podia-input" />
                    </div>

                    {isTeacher ? (
                        <>
                            <div>
                                <label className="podia-label">Teacher ID</label>
                                <input name="teacherId" type="text" required onChange={e => setFormData({ ...formData, [e.target.name]: e.target.value })} className="podia-input" />
                            </div>
                            <div>
                                <label className="podia-label">Subjects <span className="text-[#1f1d1d]/50 font-medium">(comma separated)</span></label>
                                <input name="subjects" type="text" onChange={e => setFormData({ ...formData, [e.target.name]: e.target.value })} className="podia-input" />
                            </div>
                        </>
                    ) : (
                        <>
                            <div>
                                <label className="podia-label">Roll Number</label>
                                <input name="rollNo" type="text" required onChange={e => setFormData({ ...formData, [e.target.name]: e.target.value })} className="podia-input" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="podia-label">Department</label>
                                    <input name="dept" type="text" required onChange={e => setFormData({ ...formData, [e.target.name]: e.target.value })} className="podia-input" />
                                </div>
                                <div>
                                    <label className="podia-label">Year</label>
                                    <input name="year" type="number" min="1" max="4" required onChange={e => setFormData({ ...formData, [e.target.name]: e.target.value })} className="podia-input" />
                                </div>
                            </div>
                        </>
                    )}

                    <div>
                        <label className="podia-label">Password</label>
                        <input name="password" type="password" required onChange={e => setFormData({ ...formData, password: e.target.value })} className="podia-input" />
                    </div>

                    {error && <div className="text-[#ef4444] bg-[#fef2f2] p-4 rounded-[16px] border-2 border-[#fecaca] text-[15px] font-bold">{error}</div>}

                    <button type="submit" disabled={loading} className="podia-btn w-full text-lg mt-2 font-bold py-4">
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>

                    <div className="text-center mt-6">
                        <p className="text-[15px] font-semibold text-[#1f1d1d]/80">
                            Already have an account? <Link to={`/${type}/login`} className="text-[#1f1d1d] underline decoration-2 underline-offset-4 hover:opacity-70 transition-opacity ml-1">Log in</Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}
