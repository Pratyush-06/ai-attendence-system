import React from 'react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-[#fdfaf6] overflow-hidden relative font-sans text-[#1f1d1d]">
            {/* Nav */}
            <nav className="flex items-center justify-between px-6 py-6 max-w-7xl mx-auto relative z-20">
                <div className="flex items-center gap-2">
                    <span className="text-2xl font-black tracking-tighter">SmartAttend</span>
                </div>
                <div className="flex items-center gap-6">
                    <Link to="/teacher/login" className="text-[15px] font-bold hover:opacity-70 transition-opacity">Login</Link>
                    <Link to="/teacher/register" className="podia-btn py-2.5 px-6 text-[15px]">Sign up free</Link>
                </div>
            </nav>

            {/* Hero */}
            <main className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32 text-center">
                {/* Floating Shapes */}
                <div className="absolute top-10 left-[10%] w-16 h-16 bg-[#e6a356] rounded-full -z-10 hidden md:block"></div>
                <div className="absolute top-40 right-[15%] w-24 h-24 bg-[#a6c5d4] rounded-full -z-10 hidden md:block" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}></div>
                <div className="absolute top-10 right-[30%] w-16 h-16 bg-[#e6a356] -z-10 rotate-12 hidden md:block" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}></div>
                <div className="absolute top-80 left-[15%] w-28 h-28 bg-[#cdb4eb] rounded-[32px] -z-10 -rotate-12 hidden md:block"></div>
                <div className="absolute bottom-20 right-[5%] w-20 h-20 bg-[#e6a356] rounded-2xl -z-10 rotate-45 hidden md:block"></div>

                <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-8 max-w-4xl mx-auto leading-[1.1]">
                    The all-in-one for <br className="hidden md:block" /> attendance tracking
                </h1>
                <p className="text-xl md:text-2xl mb-10 max-w-2xl mx-auto leading-normal font-medium">
                    Join thousands of teachers and students who use SmartAttend to track location-verified classes seamlessly.
                </p>
                <div className="flex justify-center gap-4 flex-col sm:flex-row">
                    <Link to="/teacher/register" className="podia-btn text-lg px-8 py-4">Start your free trial</Link>
                    <Link to="/student/login" className="podia-btn-outline text-lg px-8 py-4 bg-white">Student Portal</Link>
                </div>

                {/* Overlapping Cards */}
                <div className="mt-28 flex flex-col md:flex-row items-end justify-center gap-4 relative md:h-[400px]">

                    {/* Blue Card */}
                    <div className="podia-card-blue rounded-t-[32px] rounded-b-[32px] md:rounded-b-none p-8 md:p-10 text-left w-full md:w-1/3 md:h-[320px] shadow-sm md:-rotate-2 origin-bottom transition-transform hover:rotate-0">
                        <h3 className="text-3xl font-black mb-3">Student Hub</h3>
                        <p className="font-semibold text-[17px] opacity-90 leading-snug">Mark attendance with QR codes, check statistics and manage your profile easily.</p>
                        <div className="mt-8 bg-[#1f1d1d] h-32 rounded-t-xl opacity-90 p-5 hidden md:block">
                            <div className="flex gap-2 items-center mb-4">
                                <div className="w-3 h-3 rounded-full bg-white/20"></div>
                                <div className="w-3 h-3 rounded-full bg-white/20"></div>
                                <div className="w-3 h-3 rounded-full bg-white/20"></div>
                            </div>
                            <div className="w-full h-8 bg-white/10 rounded-lg"></div>
                        </div>
                    </div>

                    {/* Orange Card (Center, taller) */}
                    <div className="podia-card-orange rounded-t-[32px] rounded-b-[32px] md:rounded-b-none p-8 md:p-10 text-left w-full md:w-1/3 md:h-[380px] shadow-lg z-10 transition-transform hover:-translate-y-2">
                        <h3 className="text-3xl font-black mb-3 text-white">Teacher Dashboard</h3>
                        <p className="font-semibold text-[17px] text-white/90 leading-snug">Host live classes, track exact location via geofencing, and view analytics in real-time.</p>
                        <div className="mt-8 bg-[#523518] h-40 rounded-t-xl p-5 hidden md:block">
                            <div className="flex gap-2 items-center mb-4">
                                <div className="w-3 h-3 rounded-full bg-white/20"></div>
                                <div className="w-3 h-3 rounded-full bg-white/20"></div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="h-16 bg-white/10 rounded-lg"></div>
                                <div className="h-16 bg-white/10 rounded-lg"></div>
                            </div>
                        </div>
                    </div>

                    {/* Purple Card */}
                    <div className="podia-card-purple rounded-t-[32px] rounded-b-[32px] md:rounded-b-none p-8 md:p-10 text-left w-full md:w-1/3 md:h-[340px] shadow-sm md:rotate-2 origin-bottom transition-transform hover:rotate-0">
                        <h3 className="text-3xl font-black mb-3">Analytics</h3>
                        <p className="font-semibold text-[17px] opacity-90 leading-snug">Gain deep insights with automated absentee marking and downloadable Excel reports.</p>
                        <div className="mt-8 bg-[#1f1d1d] h-32 rounded-t-xl opacity-90 p-5 flex justify-between items-end hidden md:flex">
                            <div className="w-[20%] h-12 bg-white/20 rounded-t-md"></div>
                            <div className="w-[20%] h-20 bg-white/20 rounded-t-md"></div>
                            <div className="w-[20%] h-16 bg-white/20 rounded-t-md"></div>
                            <div className="w-[20%] h-24 bg-[#e6a356] rounded-t-md"></div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Bottom Curve */}
            <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-20 pointer-events-none hidden md:block">
                <svg className="relative block w-[calc(100%+1.3px)] h-[120px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
                    <path d="M0,120H1200V0C1000,100,200,80,0,0V120Z" fill="#1f1d1d"></path>
                </svg>
            </div>

            {/* Footer matching curve */}
            <footer className="bg-[#1f1d1d] text-white py-12 relative z-10 md:-mt-1">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="font-black text-2xl tracking-tighter">SmartAttend</div>
                    <div className="text-[15px] font-medium opacity-80">© {new Date().getFullYear()} SmartAttend. Made for educators.</div>
                </div>
            </footer>
        </div>
    );
}
