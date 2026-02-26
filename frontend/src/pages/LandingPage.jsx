import React from 'react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-[#fdfaf6] overflow-x-hidden relative font-sans text-[#1f1d1d]">
            {/* Nav */}
            <nav className="flex items-center justify-between px-4 sm:px-6 py-5 max-w-7xl mx-auto relative z-20">
                <span className="text-xl sm:text-2xl font-black tracking-tighter">SmartAttend</span>
                <div className="flex items-center gap-3 sm:gap-6">
                    <Link to="/teacher/login" className="text-sm sm:text-[15px] font-bold hover:opacity-70 transition-opacity">Login</Link>
                    <Link to="/teacher/register" className="podia-btn py-2 px-4 sm:py-2.5 sm:px-6 text-sm sm:text-[15px]">Sign up free</Link>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-12 sm:pt-20 pb-20 sm:pb-32 text-center">
                {/* Floating Shapes – hidden on mobile */}
                <div className="absolute top-10 left-[10%] w-16 h-16 bg-[#e6a356] rounded-full -z-10 hidden lg:block"></div>
                <div className="absolute top-40 right-[15%] w-24 h-24 bg-[#a6c5d4] rounded-full -z-10 hidden lg:block" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}></div>
                <div className="absolute top-10 right-[30%] w-16 h-16 bg-[#e6a356] -z-10 rotate-12 hidden lg:block" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}></div>
                <div className="absolute top-80 left-[15%] w-28 h-28 bg-[#cdb4eb] rounded-[32px] -z-10 -rotate-12 hidden lg:block"></div>
                <div className="absolute bottom-20 right-[5%] w-20 h-20 bg-[#e6a356] rounded-2xl -z-10 rotate-45 hidden lg:block"></div>

                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight mb-6 sm:mb-8 max-w-4xl mx-auto leading-[1.1]">
                    The all-in-one for <br className="hidden md:block" /> attendance tracking
                </h1>
                <p className="text-lg sm:text-xl md:text-2xl mb-8 sm:mb-10 max-w-2xl mx-auto leading-normal font-medium px-2">
                    Join thousands of teachers and students who use SmartAttend to track location-verified classes seamlessly.
                </p>
                <div className="flex justify-center gap-3 sm:gap-4 flex-col sm:flex-row">
                    <Link to="/teacher/login" className="podia-btn text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4">Teacher Portal</Link>
                    <Link to="/student/login" className="podia-btn-outline text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 bg-white">Student Portal</Link>
                </div>

                {/* Hero Cards */}
                <div className="mt-16 sm:mt-28 flex flex-col md:flex-row items-stretch md:items-end justify-center gap-4 relative md:h-[400px]">
                    {/* Blue Card */}
                    <div className="podia-card-blue rounded-[24px] md:rounded-b-none p-7 md:p-10 text-left w-full md:w-1/3 md:h-[320px] shadow-sm md:-rotate-2 origin-bottom transition-transform hover:rotate-0">
                        <h3 className="text-2xl sm:text-3xl font-black mb-3">Student Hub ‣</h3>
                        <p className="font-semibold text-base sm:text-[17px] opacity-90 leading-snug">Mark attendance with QR codes, check statistics and manage your profile easily.</p>
                        <div className="mt-6 md:mt-8 bg-[#1f1d1d] h-24 md:h-32 rounded-t-xl opacity-90 p-4">
                            <div className="flex gap-2 items-center mb-3">
                                <div className="w-2.5 h-2.5 rounded-full bg-white/20"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-white/20"></div>
                            </div>
                            <div className="w-full h-7 bg-white/10 rounded-lg"></div>
                        </div>
                    </div>

                    {/* Orange Card (Center) */}
                    <div className="podia-card-orange rounded-[24px] md:rounded-b-none p-7 md:p-10 text-left w-full md:w-1/3 md:h-[380px] shadow-lg z-10 transition-transform hover:-translate-y-2">
                        <h3 className="text-2xl sm:text-3xl font-black mb-3">Live Class ‣</h3>
                        <p className="font-semibold text-base sm:text-[17px] leading-snug">Host live classes, track exact location via geofencing, and view analytics in real-time.</p>
                        <div className="mt-6 md:mt-8 bg-[#523518] h-24 md:h-40 rounded-t-xl"></div>
                    </div>

                    {/* Purple Card */}
                    <div className="podia-card-purple rounded-[24px] md:rounded-b-none p-7 md:p-10 text-left w-full md:w-1/3 md:h-[340px] shadow-sm md:rotate-2 origin-bottom transition-transform hover:rotate-0">
                        <h3 className="text-2xl sm:text-3xl font-black mb-3">Analytics ‣</h3>
                        <p className="font-semibold text-base sm:text-[17px] opacity-90 leading-snug">Gain deep insights with automated absentee marking and downloadable Excel reports.</p>
                        <div className="mt-6 md:mt-8 bg-[#1f1d1d] h-24 md:h-32 rounded-t-xl opacity-90 p-4 flex justify-between items-end">
                            <div className="w-[20%] h-8 md:h-12 bg-white/20 rounded-t-md"></div>
                            <div className="w-[20%] h-14 md:h-20 bg-white/20 rounded-t-md"></div>
                            <div className="w-[20%] h-16 md:h-24 bg-[#e6a356] rounded-t-md"></div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Curve Divider */}
            <div className="w-full overflow-hidden leading-none z-20 md:-mt-10 relative hidden md:block">
                <svg className="relative block w-full h-[120px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
                    <path d="M1200,120H0V0C200,100,1000,80,1200,0V120Z" fill="#ffffff"></path>
                </svg>
            </div>

            {/* Testimonials / Stories Section */}
            <div className="bg-white pb-20 sm:pb-32 pt-16 sm:pt-20">
                <section className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-5 sm:mb-6 leading-tight">
                        Their schools finally found an all-in-one system with SmartAttend. So can yours.
                    </h2>
                    <p className="text-base sm:text-xl mb-12 sm:mb-20 max-w-3xl mx-auto font-medium text-[#1f1d1d]/80">
                        More than 150,000 educators — including professors, teaching assistants, instructors, and administrators — manage their attendance on SmartAttend.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 text-left">
                        {/* Story 1 - Orange */}
                        <div className="group cursor-pointer">
                            <div className="bg-[#e6a356] h-56 sm:h-72 w-full rounded-[20px] sm:rounded-[24px] flex items-center justify-center overflow-hidden">
                                <div className="w-28 h-28 sm:w-40 sm:h-40 bg-[#1f1d1d]/20 rounded-full flex items-center justify-center text-5xl sm:text-7xl font-black text-white/80">S</div>
                            </div>
                            <div className="py-5 sm:py-8">
                                <p className="text-[11px] sm:text-[13px] font-bold tracking-[0.15em] uppercase mb-3 sm:mb-4">Educator Stories</p>
                                <h4 className="text-xl sm:text-2xl font-black mb-2 sm:mb-3 group-hover:underline">Dr. Sarah Jenkins ‣</h4>
                                <p className="font-semibold text-base sm:text-lg opacity-80 leading-relaxed">SmartAttend creator Dr. Sarah Jenkins is a college professor. Her setup helps track 200+ students instantly.</p>
                            </div>
                        </div>

                        {/* Story 2 - Blue */}
                        <div className="group cursor-pointer">
                            <div className="bg-[#a6c5d4] h-56 sm:h-72 w-full rounded-[20px] sm:rounded-[24px] flex items-center justify-center overflow-hidden">
                                <div className="w-28 h-28 sm:w-40 sm:h-40 bg-[#1f1d1d]/20 rounded-full flex items-center justify-center text-5xl sm:text-7xl font-black text-white/80">M</div>
                            </div>
                            <div className="py-5 sm:py-8">
                                <p className="text-[11px] sm:text-[13px] font-bold tracking-[0.15em] uppercase mb-3 sm:mb-4">Educator Stories</p>
                                <h4 className="text-xl sm:text-2xl font-black mb-2 sm:mb-3 group-hover:underline">Prof. Michael C. ‣</h4>
                                <p className="font-semibold text-base sm:text-lg opacity-80 leading-relaxed">Michael shares how he's building his tracking online. The geofencing helps him uncover true analytics.</p>
                            </div>
                        </div>

                        {/* Story 3 - Purple */}
                        <div className="group cursor-pointer sm:col-span-2 md:col-span-1">
                            <div className="bg-[#cdb4eb] h-56 sm:h-72 w-full rounded-[20px] sm:rounded-[24px] flex items-center justify-center overflow-hidden">
                                <div className="w-28 h-28 sm:w-40 sm:h-40 bg-[#1f1d1d]/20 rounded-full flex items-center justify-center text-5xl sm:text-7xl font-black text-white/80">E</div>
                            </div>
                            <div className="py-5 sm:py-8">
                                <p className="text-[11px] sm:text-[13px] font-bold tracking-[0.15em] uppercase mb-3 sm:mb-4">Educator Stories</p>
                                <h4 className="text-xl sm:text-2xl font-black mb-2 sm:mb-3 group-hover:underline">Emily Rodriguez ‣</h4>
                                <p className="font-semibold text-base sm:text-lg opacity-80 leading-relaxed">Learn how Emily left paper sheets behind and turned a 300-person auditorium into a seamless experience.</p>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {/* Feature Zig-Zags */}
            <div className="bg-[#fdfaf6] py-16 sm:py-24 space-y-20 sm:space-y-32">

                {/* 1. Customize - Orange */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center gap-10 sm:gap-16">
                    <div className="w-full md:w-[55%]">
                        <div className="bg-[#e6a356] w-full aspect-[4/3] rounded-[24px] sm:rounded-[32px] relative flex flex-col justify-center items-center overflow-hidden">
                            <div className="absolute top-8 right-8 sm:top-12 sm:right-12 w-12 h-12 sm:w-16 sm:h-16 bg-[#523518] rounded-full flex items-center justify-center shadow-md">
                                <div className="w-5 h-5 border-b-2 border-r-2 border-white rotate-45 mb-0.5 mr-0.5"></div>
                            </div>
                            <div className="absolute bottom-10 left-8 sm:bottom-16 sm:left-12 w-14 h-14 sm:w-20 sm:h-20 bg-[#fdfaf6] rounded-[16px] sm:rounded-[20px] -rotate-12 shadow-sm" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}></div>
                            <div className="bg-white w-[70%] h-[55%] rounded-xl shadow-2xl p-4 sm:p-6 border-2 border-[#e0dad2] flex flex-col z-10 mr-8 mt-8">
                                <div className="text-[#e6a356] font-black text-xl sm:text-2xl mb-1">99%</div>
                                <div className="font-black text-base sm:text-xl mb-4">7-Day Attendance Streak</div>
                                <div className="space-y-2 sm:space-y-3 mb-4">
                                    <div className="h-2 sm:h-3 w-full bg-[#f0ebe1] rounded-full"></div>
                                    <div className="h-2 sm:h-3 w-4/5 bg-[#f0ebe1] rounded-full"></div>
                                    <div className="h-2 sm:h-3 w-3/4 bg-[#f0ebe1] rounded-full"></div>
                                </div>
                                <div className="mt-auto inline-block bg-[#e6a356] text-[#1f1d1d] font-bold px-3 py-1.5 rounded-full text-[11px] w-max">Export CSV</div>
                            </div>
                            <div className="absolute bottom-6 right-6 bg-[#523518] rounded-xl shadow-2xl p-4 text-white w-[160px] sm:w-[200px] z-20">
                                <p className="text-[9px] font-bold tracking-widest text-white/50 mb-2 uppercase">Export Settings</p>
                                <div className="flex justify-between text-xs font-semibold mb-2"><span>Format</span><span>Excel ▾</span></div>
                                <div className="flex justify-between text-xs font-semibold mb-2"><span>Filter</span><span>Absent ▾</span></div>
                                <div className="flex justify-between text-xs font-semibold"><span>Date</span><span>Today ▾</span></div>
                            </div>
                        </div>
                    </div>
                    <div className="w-full md:w-[45%]">
                        <h2 className="text-3xl sm:text-4xl md:text-[44px] leading-tight font-black mb-5 sm:mb-6">Customize without compromise</h2>
                        <p className="text-base sm:text-xl font-medium mb-6 sm:mb-8 text-[#1f1d1d]/80 leading-relaxed">
                            Don't settle for generic spreadsheets. Choose from SmartAttend's stunning, professionally-designed analytic views, and easily filter data to make it feel like your own.
                        </p>
                        <Link to="/teacher/register" className="podia-btn px-6 sm:px-8 bg-[#523518] hover:bg-[#3d2712] inline-flex">Learn more ‣</Link>
                    </div>
                </section>

                {/* 2. Live Record - Purple */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row-reverse items-center gap-10 sm:gap-16">
                    <div className="w-full md:w-[55%]">
                        <div className="bg-[#cdb4eb] w-full aspect-[4/3] rounded-[24px] sm:rounded-[32px] relative flex justify-center items-center">
                            <div className="absolute top-8 left-12 w-12 h-12 bg-white/40 -rotate-12" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}></div>
                            <div className="absolute top-1/2 right-8 w-12 h-12 bg-[#2d1b4e] rounded-xl shadow-xl flex items-center justify-center rotate-12">
                                <div className="w-5 h-4 border-2 border-white rounded-[2px]"></div>
                            </div>
                            <div className="absolute bottom-6 left-16 w-12 h-12 bg-[#2d1b4e] rounded-xl shadow-xl flex items-center justify-center -rotate-12">
                                <div className="w-5 h-5 border-b-2 border-l-2 border-white rounded-bl-md"></div>
                            </div>
                            <div className="bg-white w-[82%] h-[63%] rounded-xl shadow-2xl p-4 sm:p-6 border-2 border-[#e0dad2] flex flex-col z-10">
                                <div className="flex flex-wrap gap-2 mb-4 text-[9px] sm:text-[10px] font-bold">
                                    <span className="bg-[#f0ebe1] px-3 py-1.5 rounded-full">TO: STUDENTS</span>
                                    <span className="bg-[#f0ebe1] px-3 py-1.5 rounded-full">PARENTS</span>
                                </div>
                                <div className="flex justify-between items-center mb-4 gap-2">
                                    <h4 className="text-base sm:text-xl font-black">Warning: Low Attendance</h4>
                                    <button className="bg-[#cdb4eb] text-[#1f1d1d] font-bold text-[10px] sm:text-xs px-3 py-1.5 rounded-full shrink-0">Send ‣</button>
                                </div>
                                <div className="flex gap-3 flex-1">
                                    <div className="w-1/3 bg-[#f0ebe1] rounded-lg"></div>
                                    <div className="w-2/3 space-y-2">
                                        <div className="h-2.5 bg-[#f0ebe1] rounded-full w-full"></div>
                                        <div className="h-2.5 bg-[#f0ebe1] rounded-full w-5/6"></div>
                                        <div className="h-2.5 bg-[#f0ebe1] rounded-full w-4/6"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="w-full md:w-[45%]">
                        <p className="text-[11px] sm:text-[13px] font-bold tracking-[0.15em] uppercase mb-3 sm:mb-4">Live Communications</p>
                        <h2 className="text-3xl sm:text-4xl md:text-[44px] leading-tight font-black mb-5 sm:mb-6">Build a reliable record</h2>
                        <p className="text-base sm:text-xl font-medium mb-6 sm:mb-8 text-[#1f1d1d]/80 leading-relaxed">
                            Leave your over-priced messaging platform behind for one that connects your attendance warnings and tracking emails seamlessly with the rest of your systems.
                        </p>
                        <Link to="/teacher/register" className="podia-btn px-6 sm:px-8 bg-[#2d1b4e] hover:bg-[#1a0f2e] inline-flex">Learn more ‣</Link>
                    </div>
                </section>

                {/* 3. Student Portal - Blue */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center gap-10 sm:gap-16">
                    <div className="w-full md:w-[55%]">
                        <div className="bg-[#a6c5d4] w-full aspect-[4/3] rounded-[24px] sm:rounded-[32px] relative flex justify-center items-end overflow-hidden">
                            <div className="absolute top-10 left-10 w-16 h-16 sm:w-24 sm:h-24 bg-[#1f1d1d] rounded-full"></div>
                            <div className="bg-white w-[88%] h-[73%] rounded-t-xl shadow-2xl p-4 sm:p-6 border-t-2 border-l-2 border-r-2 border-[#e0dad2] flex flex-col z-10 translate-y-4">
                                {[{ name: 'Computer Networks', status: 'Present', color: '#10b981' }, { name: 'Database Systems', status: 'Absent', color: '#ef4444' }, { name: 'Data Structures', status: 'Present', color: '#10b981' }].map((item, i) => (
                                    <div key={i} className="bg-[#f0ebe1] w-full h-10 sm:h-12 rounded-lg mb-2 sm:mb-3 flex items-center px-3 sm:px-4 justify-between">
                                        <div className="font-bold text-xs sm:text-sm">{item.name}</div>
                                        <div className="flex gap-2 items-center text-xs font-bold opacity-70">
                                            <span>{item.status}</span>
                                            <div className="w-3 h-3 rounded-full" style={{ background: item.color }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="w-full md:w-[45%]">
                        <p className="text-[11px] sm:text-[13px] font-bold tracking-[0.15em] uppercase mb-3 sm:mb-4">Student Portal</p>
                        <h2 className="text-3xl sm:text-4xl md:text-[44px] leading-tight font-black mb-5 sm:mb-6">Track anything you can imagine</h2>
                        <p className="text-base sm:text-xl font-medium mb-6 sm:mb-8 text-[#1f1d1d]/80 leading-relaxed">
                            Give your students the ability to track their progress. Upload your subjects and leave the record keeping, analytics, and history to us.
                        </p>
                        <Link to="/student/login" className="podia-btn px-6 sm:px-8 inline-flex">Learn more ‣</Link>
                    </div>
                </section>
            </div>

            {/* Footer */}
            <div className="bg-[#1f1d1d] pt-10 sm:pt-12">
                <div className="w-full overflow-hidden leading-none rotate-180 hidden md:block -mt-10">
                    <svg className="relative block w-full h-[60px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
                        <path d="M1200,120H0V0C200,100,1000,80,1200,0V120Z" fill="#fdfaf6"></path>
                    </svg>
                </div>
                <footer className="text-white py-10 sm:py-12 px-4 sm:px-6">
                    <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-6">
                        <div className="font-black text-xl sm:text-2xl tracking-tighter">SmartAttend</div>
                        <div className="text-sm sm:text-[15px] font-medium opacity-80 text-center sm:text-right">© {new Date().getFullYear()} SmartAttend. Made for educators.</div>
                    </div>
                </footer>
            </div>

            {/* Floating help icon */}
            <div className="fixed bottom-5 right-5 z-50">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#1f1d1d] rounded-full flex items-center justify-center text-white text-lg sm:text-xl font-bold cursor-pointer hover:bg-[#333131] shadow-2xl transition-colors">?</div>
            </div>
        </div>
    );
}
