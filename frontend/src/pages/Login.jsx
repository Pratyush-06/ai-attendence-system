import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '@/utils/api';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';

export default function Login({ type }) {
    const navigate = useNavigate();
    const { login } = useAuth();

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
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="sm:mx-auto sm:w-full sm:max-w-md"
            >
                <Card className="shadow-lg border-slate-200">
                    <CardHeader className="space-y-4 pb-6 mt-4">
                        <div className="flex justify-center">
                            <div className={`p-4 rounded-full bg-${themeColor}-100 text-${themeColor}-600`}>
                                <LogIn className="w-8 h-8" />
                            </div>
                        </div>
                        <div className="text-center">
                            <CardTitle className="text-2xl font-bold">Sign in to {isTeacher ? 'Teacher' : 'Student'} Portal</CardTitle>
                            <CardDescription className="text-md mt-2">Enter your credentials to access your dashboard.</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <form className="space-y-6" onSubmit={handleSubmit}>

                            <div className="space-y-2">
                                <Label htmlFor="id">{isTeacher ? 'Teacher ID' : 'Roll Number'}</Label>
                                <Input
                                    id={isTeacher ? 'teacherId' : 'rollNo'}
                                    name={isTeacher ? 'teacherId' : 'rollNo'}
                                    type="text" required onChange={handleChange}
                                />
                            </div>

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
                                {loading ? 'Signing in...' : 'Sign in'}
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
