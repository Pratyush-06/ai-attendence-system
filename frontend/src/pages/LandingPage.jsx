import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';

export default function LandingPage() {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: 'spring', stiffness: 100 }
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
            <motion.div
                className="text-center mb-12"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-4 tracking-tight">
                    Smart <span className="text-indigo-600">Attendance</span>
                </h1>
                <p className="text-lg text-slate-600 max-w-xl mx-auto">
                    A seamless geofenced QR code attendance system for modern classrooms.
                </p>
            </motion.div>

            <motion.div
                className="grid md:grid-cols-2 gap-8 w-full max-w-4xl"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Student Card */}
                <motion.div variants={itemVariants} whileHover={{ y: -5 }}>
                    <Card className="h-full border-indigo-100 shadow-lg hover:shadow-xl transition-all duration-300">
                        <CardHeader className="text-center pb-2">
                            <div className="mx-auto bg-indigo-100 p-4 rounded-full mb-4 w-16 h-16 flex items-center justify-center">
                                <Users className="w-8 h-8 text-indigo-600" />
                            </div>
                            <CardTitle className="text-2xl">Student Portal</CardTitle>
                            <CardDescription className="text-base mt-2">
                                Scan QR codes to log your location-based attendance instantly.
                            </CardDescription>
                        </CardHeader>
                        <CardFooter className="flex flex-col gap-3 mt-4">
                            <Button asChild className="w-full bg-indigo-600 hover:bg-indigo-700 text-md py-6">
                                <Link to="/student/login">Student Login</Link>
                            </Button>
                            <Button asChild variant="outline" className="w-full text-indigo-600 border-indigo-200 hover:bg-indigo-50 text-md py-6">
                                <Link to="/student/register">Create Account</Link>
                            </Button>
                        </CardFooter>
                    </Card>
                </motion.div>

                {/* Teacher Card */}
                <motion.div variants={itemVariants} whileHover={{ y: -5 }}>
                    <Card className="h-full border-emerald-100 shadow-lg hover:shadow-xl transition-all duration-300">
                        <CardHeader className="text-center pb-2">
                            <div className="mx-auto bg-emerald-100 p-4 rounded-full mb-4 w-16 h-16 flex items-center justify-center">
                                <GraduationCap className="w-8 h-8 text-emerald-600" />
                            </div>
                            <CardTitle className="text-2xl">Teacher Portal</CardTitle>
                            <CardDescription className="text-base mt-2">
                                Generate dynamic QR codes and seamlessly export class records.
                            </CardDescription>
                        </CardHeader>
                        <CardFooter className="flex flex-col gap-3 mt-4">
                            <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700 text-md py-6">
                                <Link to="/teacher/login">Teacher Login</Link>
                            </Button>
                            <Button asChild variant="outline" className="w-full text-emerald-600 border-emerald-200 hover:bg-emerald-50 text-md py-6">
                                <Link to="/teacher/register">Create Account</Link>
                            </Button>
                        </CardFooter>
                    </Card>
                </motion.div>
            </motion.div>
        </div>
    );
}
