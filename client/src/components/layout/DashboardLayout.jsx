import React, { useState } from 'react';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';

const DashboardLayout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
            <div className="hidden lg:block border-r bg-white">
                <Sidebar />
            </div>

            <div className="flex flex-col">
                <TopNavbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
                <main className="flex-1 p-6 lg:p-10 bg-slate-50/50">
                    {children}
                </main>
            </div>

            {/* Mobile Sidebar Overlay (Simple implementation) */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm lg:hidden">
                    <div className="fixed inset-y-0 left-0 z-50 w-full max-w-xs bg-background p-0 shadow-lg">
                        <Sidebar />
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="absolute top-4 right-4 p-2"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardLayout;
