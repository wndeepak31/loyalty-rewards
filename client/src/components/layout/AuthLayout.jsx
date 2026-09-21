import React from 'react';
import { Link } from 'react-router-dom';
import BrandLogo from '../ui/BrandLogo';

const AuthLayout = ({ children, title, subtitle }) => {
    return (
        <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white">
            {/* Left Column: Effission Brand Showcase with Jewelry Watermarks */}
            <div className="relative w-full lg:w-[48%] xl:w-[45%] bg-gradient-to-br from-[#f26522] via-[#f36c14] to-[#ea580c] text-white p-8 md:p-12 lg:p-16 flex flex-col justify-between overflow-hidden shrink-0 min-h-[340px] lg:min-h-screen">
                {/* Jewelry Vector Watermarks Overlay */}
                <div className="absolute inset-0 pointer-events-none opacity-20 select-none overflow-hidden">
                    {/* Top Left Sun/Bangle Motif */}
                    <svg className="absolute -top-10 -left-10 w-48 h-48 text-white stroke-current fill-none stroke-[1.5]" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="30" strokeDasharray="4 4" />
                        <circle cx="50" cy="50" r="20" />
                        <circle cx="50" cy="50" r="10" />
                        <line x1="50" y1="10" x2="50" y2="20" />
                        <line x1="50" y1="80" x2="50" y2="90" />
                        <line x1="10" y1="50" x2="20" y2="50" />
                        <line x1="80" y1="50" x2="90" y2="50" />
                    </svg>

                    {/* Solitaire Diamond Ring Motif */}
                    <svg className="absolute top-12 right-20 w-16 h-16 text-white stroke-current fill-none stroke-[1.5]" viewBox="0 0 48 48">
                        <circle cx="24" cy="28" r="14" />
                        <polygon points="18,12 30,12 34,16 24,24 14,16" />
                    </svg>

                    {/* Dangling Earring / Pendant Motif */}
                    <svg className="absolute top-36 right-8 w-14 h-24 text-white stroke-current fill-none stroke-[1.5]" viewBox="0 0 32 64">
                        <circle cx="16" cy="10" r="4" />
                        <line x1="16" y1="14" x2="16" y2="26" />
                        <polygon points="16,26 24,40 16,56 8,40" />
                    </svg>

                    {/* Diamond Gem Facet Motif */}
                    <svg className="absolute top-[48%] left-10 w-16 h-16 text-white stroke-current fill-none stroke-[1.5]" viewBox="0 0 48 48">
                        <polygon points="12,14 36,14 42,22 24,38 6,22" />
                        <line x1="12" y1="14" x2="24" y2="38" />
                        <line x1="36" y1="14" x2="24" y2="38" />
                        <line x1="6" y1="22" x2="42" y2="22" />
                    </svg>

                    {/* Interlinked Rings */}
                    <svg className="absolute bottom-24 right-16 w-24 h-20 text-white stroke-current fill-none stroke-[1.5]" viewBox="0 0 64 48">
                        <ellipse cx="24" cy="24" rx="16" ry="12" transform="rotate(-15 24 24)" />
                        <ellipse cx="40" cy="24" rx="16" ry="12" transform="rotate(15 40 24)" />
                    </svg>

                    {/* Beaded Necklace Arc */}
                    <svg className="absolute -bottom-12 -left-8 w-56 h-56 text-white stroke-current fill-none stroke-[1.5]" viewBox="0 0 120 120">
                        <path d="M 20 20 Q 60 100 100 20" strokeDasharray="3 6" strokeWidth="2.5" />
                        <circle cx="60" cy="60" r="6" />
                    </svg>

                    {/* Floating Subtle Sparkling stars */}
                    <svg className="absolute top-[28%] right-[35%] w-8 h-8 text-white fill-current" viewBox="0 0 24 24">
                        <path d="M12 0L14 9L23 12L14 15L12 24L10 15L1 12L10 9Z" opacity="0.4" />
                    </svg>
                </div>

                {/* Return Home Link */}
                <div className="relative z-10">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 text-xs font-semibold text-white/80 hover:text-white transition-colors"
                    >
                        <span>←</span> Return to home
                    </Link>
                </div>

                {/* Main Hero Showcase */}
                <div className="relative z-10 py-10 my-auto">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 border border-white/25 rounded-full mb-6 backdrop-blur-md">
                        <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                        <span className="text-[10px] font-black uppercase tracking-wider text-white">Effission Loyalty & Gold Vault</span>
                    </div>

                    <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-[1.1]">
                        Grow Your <br />
                        Rewards with Effission
                    </h1>
                    <p className="mt-5 text-sm sm:text-base text-white/90 font-normal leading-relaxed max-w-md">
                        Track your luxury jewellery purchases, unlock tiered rewards from Silver to Diamond, and redeem points for pure hallmarked gold.
                    </p>

                    <div className="mt-8 space-y-3.5">
                        <div className="flex items-center gap-3 text-xs font-semibold text-white/95">
                            <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center shrink-0 font-black text-xs">✓</div>
                            <span>Earn 10% to 25% Loyalty Points on Fine Jewellery</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs font-semibold text-white/95">
                            <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center shrink-0 font-black text-xs">✓</div>
                            <span>Redeem for 22k / 24k Certified Gold Coins & Bespoke Gifts</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs font-semibold text-white/95">
                            <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center shrink-0 font-black text-xs">✓</div>
                            <span>Seamless Integration with Effission 10+1 Gold Savings Scheme</span>
                        </div>
                    </div>
                </div>

                {/* Footer attribution */}
                <div className="relative z-10 text-[11px] text-white/60">
                    Effission Jewellery & Loyalty Platform • Secure Authentication
                </div>
            </div>

            {/* Right Column: Form with Logo */}
            <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-10 lg:p-16 bg-[#FAFAF8]">
                <div className="w-full max-w-md space-y-6">
                    {/* Brand Logo Header */}
                    <div className="flex justify-center mb-6">
                        <Link to="/">
                            <BrandLogo
                                imageClassName="h-10 w-auto object-contain"
                                showBadge={true}
                                badgeText="Rewards"
                            />
                        </Link>
                    </div>

                    <div className="text-center">
                        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">{title}</h2>
                        {subtitle && <p className="text-slate-500 text-sm mt-1.5">{subtitle}</p>}
                    </div>

                    <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
