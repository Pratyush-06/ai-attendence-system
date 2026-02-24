import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '@/utils/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';

export default function Register({ type }) {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({});
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const isTeacher = type === 'teacher';
    const themeColor = isTeacher ? 'emerald' : 'indigo';

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const endpoint = isTeacher ? '/auth/teacher/register' : '/auth/student/register';
            const payload = { ...formData };

            if (isTeacher && payload.subjects) {
                payload.subjects = payload.subjects
                    .split(',')
                    .map((s) => s.trim())
                    .filter(Boolean);
            }

            await api.post(endpoint, payload);
            navigate(`/${type}/login`);
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="sm:mx-auto sm:w-full sm:max-w-md"
            >
                <Card className="shadow-lg border-slate-200">
                    <CardHeader className="space-y-4 pb-6">
                        <div className="flex justify-center">
                            <div className={`p-4 rounded-full bg-${themeColor}-100 text-${themeColor}-600`}>
                                <UserPlus className="w-8 h-8" />
                            </div>
                        </div>
                        <div className="text-center">
                            <CardTitle className="text-2xl font-bold">Register as a {isTeacher ? 'Teacher' : 'Student'}</CardTitle>
                            <CardDescription className="text-md mt-2">Create your account to get started.</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <form className="space-y-5" onSubmit={handleSubmit}>
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input id="name" name="name" type="text" required onChange={handleChange} />
                            </div>

                            {isTeacher ? (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="teacherId">Teacher ID</Label>
                                        <Input id="teacherId" name="teacherId" type="text" required onChange={handleChange} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="subjects">Subjects (comma separated)</Label>
                                        <Input id="subjects" name="subjects" type="text" placeholder="Math, Physics" onChange={handleChange} />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="rollNo">Roll Number</Label>
                                        <Input id="rollNo" name="rollNo" type="text" required onChange={handleChange} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="dept">Department</Label>
                                            <Input id="dept" name="dept" type="text" required onChange={handleChange} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="year">Year</Label>
                                            <Input id="year" name="year" type="number" min="1" max="4" required onChange={handleChange} />
                                        </div>
                                    </div>
                                </>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input id="password" name="password" type="password" required onChange={handleChange} />
                            </div>

                            {error && (
                                <div className="text-red-600 text-sm text-center font-medium bg-red-50 p-3 rounded-md border border-red-100">
                                    {error}
                                </div>
                            )}

                            <Button
                                type="submit"
                                disabled={loading}
                                className={`w-full py-5 text-md font-medium ${isTeacher ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                            >
                                {loading ? 'Creating Account...' : 'Create Account'}
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="flex justify-center pb-6">
                        <Link to="/" className="text-sm text-slate-500 hover:text-slate-900 flex items-center justify-center gap-1 transition-colors">
                            <ArrowLeft className="w-4 h-4" /> Back to Home
                        </Link>
                    </CardFooter>
                </Card>
            </motion.div>
        </div>
    );
}
