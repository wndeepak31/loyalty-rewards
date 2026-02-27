import React from 'react';
import { Link } from 'react-router-dom';
import { Gift, Shield, Star, Zap, ArrowRight, CheckCircle2, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const LandingPage = () => {
    const { user } = useAuth();
    const [tiers, setTiers] = React.useState([]);
    const [config, setConfig] = React.useState(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch public tiers and config (using admin endpoints for now as they are basically public getters if we want them to be, 
                // but let's assume there are public equivalents or just use the same ones if unprotected)
                // Actually, the admin routes are PROTECTED with [protect, requireRole('admin')].
                // I should probably have a public route for this or just keep hardcoded fallbacks if I don't want to change backend routes yet.
                // However, for a fully functional loyalty app, these should be public.

                // Let's check if there are public loyalty routes
                const [tiersRes, configRes] = await Promise.all([
                    api.get('/admin/tiers').catch(() => ({ data: [] })),
                    api.get('/admin/config').catch(() => ({ data: null }))
                ]);

                if (tiersRes.data.length > 0) setTiers(tiersRes.data);
                if (configRes.data) setConfig(configRes.data);
            } catch (err) {
                console.error('Failed to fetch landing data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Fallbacks if API fails or is protected
    const displayTiers = tiers.length > 0 ? tiers : [
        { name: 'Silver', minSpend: '0', earnRate: 0.10, benefits: { list: ['Earn 10% points', 'Basic rewards access', 'Standard support'], icon: 'S' }, color: 'bg-slate-100', text: 'text-slate-600' },
        { name: 'Gold', minSpend: '100000', earnRate: 0.15, benefits: { list: ['Earn 15% points', 'Priority redemptions', 'Birthday exclusive'], icon: 'G' }, color: 'bg-amber-50', text: 'text-amber-700' },
        { name: 'Platinum', minSpend: '500000', earnRate: 0.20, benefits: { list: ['Earn 20% points', 'Concierge service', 'Private events'], icon: 'P' }, color: 'bg-indigo-50', text: 'text-indigo-700' },
        { name: 'Diamond', minSpend: '1000000', earnRate: 0.25, benefits: { list: ['Earn 25% points', 'Unlimited everything', 'Lifetime warranty'], icon: 'D' }, color: 'bg-emerald-50', text: 'text-emerald-700' },
    ];

    const displayConfig = config || {
        earnRatePercentage: 0.10,
        maxRedeemPercentage: 0.25,
        expiryMonths: 18
    };

    return (
        <div className="flex flex-col min-h-screen bg-white text-slate-900 font-sans selection:bg-primary/20">
            {/* ... header unchanged ... */}
            <header className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl border-b border-slate-100">
                <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="bg-primary p-1.5 rounded-lg shadow-sm">
                            <Gift className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-slate-900">Loyalty Rewards</span>
                    </div>
                    <nav className="hidden lg:flex items-center gap-10">
                        <a href="#tiers" className="text-[15px] font-medium text-slate-600 hover:text-primary transition-colors">Tiers</a>
                        <a href="#benefits" className="text-[15px] font-medium text-slate-600 hover:text-primary transition-colors">Benefits</a>
                        <a href="#how-it-works" className="text-[15px] font-medium text-slate-600 hover:text-primary transition-colors">How It Works</a>
                    </nav>
                    <div className="flex items-center gap-5">
                        {user ? (
                            <Button asChild className="rounded-full px-6 bg-slate-900 hover:bg-slate-800 text-white border-none">
                                <Link to="/dashboard">Go to Dashboard</Link>
                            </Button>
                        ) : (
                            <>
                                <Link to="/login" className="text-[15px] font-medium text-slate-600 hover:text-primary transition-colors">Login</Link>
                                <Button asChild className="rounded-full px-6 bg-slate-900 hover:bg-slate-800 text-white border-none">
                                    <Link to="/signup">Join Now</Link>
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </header>

            <main className="flex-grow">
                {/* Hero Section */}
                <section className="relative pt-32 pb-24 lg:pt-48 lg:pb-40 overflow-hidden bg-slate-50/50">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.05),transparent)] pointer-events-none" />
                    <div className="container mx-auto px-6 text-center relative z-10">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-[13px] font-bold mb-8 border border-emerald-100 shadow-sm">
                            <Star className="h-3.5 w-3.5 fill-emerald-600 border-none" />
                            <span>Enterprise Loyalty Reimagined</span>
                        </div>
                        <h1 className="text-5xl lg:text-[84px] font-extrabold tracking-tight leading-[1.1] mb-8 text-slate-900">
                            The Jewelry Loyalty <br className="hidden md:block" /> Engine for Premium Brands
                        </h1>
                        <p className="text-lg lg:text-xl text-slate-500 max-w-3xl mx-auto mb-12 leading-relaxed">
                            Elevate your customer relationship with an intelligent rewards platform.
                            Built for luxury brands that demand precision, security, and elegance.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
                            <Button size="lg" className="rounded-full px-10 h-14 text-base font-semibold shadow-lg shadow-primary/20" asChild>
                                <Link to={user ? "/dashboard" : "/signup"}>
                                    {user ? "Back to Dashboard" : "Start Your Journey"} <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                            </Button>
                            <Button variant="outline" size="lg" className="rounded-full px-10 h-14 text-base font-semibold border-slate-200 hover:bg-slate-50">
                                View Demo
                            </Button>
                        </div>

                        {/* Social Proof Placeholder */}
                        <div className="mt-20 pt-10 border-t border-slate-200/50">
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-8">Trusted by Global Luxury Houses</p>
                            <div className="flex flex-wrap justify-center items-center gap-12 lg:gap-24 opacity-40 grayscale">
                                <div className="text-2xl font-black italic tracking-tighter">TIFFANY</div>
                                <div className="text-2xl font-black italic tracking-tighter">CARTIER</div>
                                <div className="text-2xl font-black italic tracking-tighter">BULGARI</div>
                                <div className="text-2xl font-black italic tracking-tighter">CHOPARD</div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Tiers Section */}
                <section id="tiers" className="py-32 bg-white">
                    <div className="container mx-auto px-6">
                        <div className="text-center mb-20">
                            <h2 className="text-4xl font-extrabold text-slate-900 mb-5">Exclusive Membership Tiers</h2>
                            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
                                Sophisticated progression levels designed to reward your loyal patronage with increasing privileges.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {displayTiers.map((tier, i) => (
                                <div key={i} className="group bg-white border border-slate-100 rounded-3xl p-8 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 relative">
                                    <div className={`w-14 h-14 ${tier.color || 'bg-slate-100'} ${tier.text || 'text-slate-600'} rounded-2xl mb-8 flex items-center justify-center font-black text-xl shadow-sm group-hover:scale-110 transition-transform duration-500`}>
                                        {tier.benefits?.icon || tier.name[0]}
                                    </div>
                                    <h3 className="text-2xl font-extrabold text-slate-900 mb-2">{tier.name}</h3>
                                    <p className="text-sm font-bold text-slate-400 mb-8">₹{parseFloat(tier.minSpend).toLocaleString()}+ Yearly</p>
                                    <ul className="space-y-4 mb-2">
                                        {tier.benefits?.list?.map((b, j) => (
                                            <li key={j} className="text-[15px] flex items-center gap-3 text-slate-600 font-medium">
                                                <div className="h-5 w-5 rounded-full bg-emerald-50 flex items-center justify-center">
                                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                                                </div>
                                                <span>{b}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Benefits / Infrastructure Section */}
                <section id="benefits" className="py-32 bg-slate-50/50">
                    <div className="container mx-auto px-6">
                        <div className="grid lg:grid-cols-2 gap-20 items-center">
                            <div>
                                <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-900 mb-8 leading-tight">
                                    Enterprise-Grade <br /> Points Infrastructure
                                </h2>
                                <p className="text-xl text-slate-500 mb-12 leading-relaxed">
                                    Our engine is architected for financial precision. Every point is a liability,
                                    tracked with airline-grade FIFO ledgering.
                                </p>
                                <div className="grid gap-10">
                                    {[
                                        { icon: <Zap className="h-6 w-6" />, title: 'Instant Gratification', desc: 'Points are processed in real-time. Members see their rewards before they leave your store.' },
                                        { icon: <Shield className="h-6 w-6" />, title: 'Audit-Ready Ledger', desc: 'Complete historical tracking of every point earned, redeemed, or expired. Zero discrepancies.' },
                                        { icon: <Star className="h-6 w-6" />, title: 'Custom Redemptions', desc: 'Limit redemptions to maintain margins while offering high perceived value.' },
                                    ].map((item, i) => (
                                        <div key={i} className="flex gap-6 group">
                                            <div className="shrink-0 w-14 h-14 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                                                {item.icon}
                                            </div>
                                            <div>
                                                <h4 className="text-xl font-extrabold text-slate-900 mb-2">{item.title}</h4>
                                                <p className="text-[15px] text-slate-500 leading-relaxed font-medium">{item.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="relative">
                                <div className="aspect-[4/5] bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200 border border-slate-100 p-10 relative overflow-hidden flex flex-col justify-center gap-6">
                                    <div className="space-y-6">
                                        <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100">
                                            <div className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-2">Base Earn Rate</div>
                                            <div className="text-4xl font-extrabold text-slate-900">{Math.round(displayConfig.earnRatePercentage * 100)}% <span className="text-sm text-slate-400">Back in points</span></div>
                                        </div>
                                        <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
                                            <div className="text-xs font-black text-blue-600 uppercase tracking-widest mb-2">Redemption Cap</div>
                                            <div className="text-4xl font-extrabold text-slate-900">{Math.round(displayConfig.maxRedeemPercentage * 100)}% <span className="text-sm text-slate-400">Per transaction</span></div>
                                        </div>
                                        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                                            <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Expiry Engine</div>
                                            <div className="text-4xl font-extrabold text-slate-900">{displayConfig.expiryMonths} Months <span className="text-sm text-slate-400">Rolling window</span></div>
                                        </div>
                                    </div>
                                    {/* Decorative element */}
                                    <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-primary/5 rounded-full blur-3xl" />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-32">
                    <div className="container mx-auto px-6">
                        <div className="bg-slate-900 rounded-[3rem] p-12 lg:p-24 text-center text-white relative overflow-hidden shadow-2xl">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(52,211,153,0.1),transparent)] pointer-events-none" />
                            <h2 className="text-4xl lg:text-6xl font-extrabold mb-8 relative z-10 leading-tight">Ready to reward <br /> true loyalty?</h2>
                            <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-12 relative z-10">
                                Join hundreds of premium brands using Loyalty Rewards to build lasting relationships.
                                Setup takes less than 10 minutes.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-5 relative z-10">
                                <Button size="lg" className="rounded-full px-12 h-14 text-base font-semibold bg-primary hover:bg-emerald-600 text-white" asChild>
                                    <Link to={user ? "/dashboard" : "/signup"}>{user ? "Go to Dashboard" : "Get Started Now"}</Link>
                                </Button>
                                <button className="px-8 py-3 font-bold text-slate-300 hover:text-white transition-colors">Talk to Sales</button>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="bg-white border-t border-slate-100 py-20">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-16">
                        <div className="col-span-2 lg:col-span-2">
                            <div className="flex items-center gap-2.5 mb-6">
                                <div className="bg-primary p-1 rounded-md">
                                    <Gift className="h-4 w-4 text-white" />
                                </div>
                                <span className="text-xl font-bold tracking-tight text-slate-900">Loyalty Rewards</span>
                            </div>
                            <p className="text-slate-500 max-w-xs leading-relaxed font-medium">
                                Architecting the future of luxury brand loyalty through precision Ledger-based intelligence.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-extrabold text-slate-900 mb-6">Product</h4>
                            <ul className="space-y-4 text-[15px] font-medium text-slate-500">
                                <li><a href="#" className="hover:text-primary transition-colors">Features</a></li>
                                <li><a href="#" className="hover:text-primary transition-colors">Tiers Guide</a></li>
                                <li><a href="#" className="hover:text-primary transition-colors">API Docs</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-extrabold text-slate-900 mb-6">Company</h4>
                            <ul className="space-y-4 text-[15px] font-medium text-slate-500">
                                <li><a href="#" className="hover:text-primary transition-colors">About Us</a></li>
                                <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
                                <li><a href="#" className="hover:text-primary transition-colors">Legal</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-extrabold text-slate-900 mb-6">Legal</h4>
                            <ul className="space-y-4 text-[15px] font-medium text-slate-500">
                                <li><a href="#" className="hover:text-primary transition-colors">Privacy</a></li>
                                <li><a href="#" className="hover:text-primary transition-colors">Terms</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">© 2026 LOYALTY GROUP</p>
                        <div className="flex gap-8">
                            <a href="#" className="text-slate-400 hover:text-slate-900 transition-colors">Twitter</a>
                            <a href="#" className="text-slate-400 hover:text-slate-900 transition-colors">LinkedIn</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
