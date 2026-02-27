import React from 'react';
import { Gift } from 'lucide-react';

const AuthLayout = ({ children, title, subtitle }) => {
    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            <div className="hidden lg:flex flex-col justify-center items-center bg-emerald-50 text-emerald-950 p-10 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-100/50 to-teal-200/50" />
                <div className="relative z-10 max-w-md text-center">
                    <div className="bg-primary h-24 w-24 rounded-3xl mx-auto mb-8 flex items-center justify-center shadow-lg transform -rotate-6">
                        <Gift className="h-12 w-12 text-primary-foreground" />
                    </div>
                    <h1 className="text-4xl font-extrabold mb-4 tracking-tight">Elysian Rewards</h1>
                    <p className="text-lg text-emerald-800/80 font-medium">
                        Join our premium loyalty program to earn rewards, track luxury purchases, and redeem exclusive bespoke offers.
                    </p>
                </div>
                {/* Abstract circles/shapes for visual interest */}
                <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-primary/10 blur-[100px] " />
                <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-blue-400/10 blur-[100px] " />
            </div>

            <div className="flex items-center justify-center p-6 bg-background">
                <div className="w-full max-w-md space-y-6">
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
                        {subtitle && <p className="text-muted-foreground mt-2">{subtitle}</p>}
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
