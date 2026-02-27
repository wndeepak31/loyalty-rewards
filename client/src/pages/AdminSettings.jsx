import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Settings, Save, RefreshCw, Star, Info, Shield, Zap, TrendingUp, ChevronRight, Clock, Percent, Award, ListChecks, ArrowUpRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { motion, AnimatePresence } from 'framer-motion';

const AdminSettings = () => {
    const [config, setConfig] = useState(null);
    const [tiers, setTiers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTierId, setActiveTierId] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [configRes, tiersRes] = await Promise.all([
                    api.get('/admin/config'),
                    api.get('/admin/tiers')
                ]);
                setConfig(configRes.data);
                setTiers(tiersRes.data);
                if (tiersRes.data.length > 0) setActiveTierId(tiersRes.data[0].id);
            } catch (err) {
                console.error('Failed to fetch settings:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleConfigSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.post('/admin/config', config);
            // alert('System configuration updated successfully!');
        } catch (err) {
            console.error('Failed to update configuration');
        } finally {
            setSaving(false);
        }
    };

    const handleTierSave = async (tier) => {
        try {
            await api.post('/admin/tiers', {
                ...tier,
                // Ensure benefits is sent as an object
                benefits: typeof tier.benefits === 'string' ? JSON.parse(tier.benefits) : tier.benefits
            });
            alert(`${tier.name} tier updated!`);
        } catch (err) {
            alert('Failed to update tier');
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
            <RefreshCw className="h-10 w-10 text-primary animate-spin" />
            <div className="text-slate-400 font-black uppercase tracking-[0.3em] text-xs">Initializing Engine...</div>
        </div>
    );

    const activeTier = tiers.find(t => t.id === activeTierId);

    return (
        <motion.div
            className="space-y-12 max-w-7xl mx-auto pb-20"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
        >
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-1 w-12 bg-primary rounded-full" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">System Command</span>
                    </div>
                    <h1 className="text-5xl font-black tracking-tight text-slate-900 mb-2">Engine Controls</h1>
                    <p className="text-slate-500 font-medium text-lg">Orchestrate your global loyalty algorithms and member thresholds.</p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-white p-5 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-50 flex items-center gap-4">
                        <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                            <RefreshCw className="h-5 w-5 text-emerald-500 animate-spin-slow" />
                        </div>
                        <div>
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Real-time Feed</div>
                            <div className="text-sm font-bold text-slate-900 leading-tight">Syncing Live</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-12 gap-10">
                {/* Global Config Section */}
                <div className="lg:col-span-4 space-y-8">
                    <Card className="border-none shadow-2xl shadow-slate-200/60 rounded-[3rem] overflow-hidden bg-white">
                        <CardHeader className="bg-slate-900 p-8">
                            <CardTitle className="text-xl font-black text-white flex items-center gap-3">
                                <Zap className="h-5 w-5 text-primary" /> Guardrails
                            </CardTitle>
                            <CardDescription className="text-slate-400 font-medium">Global system constants</CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 pt-10">
                            <form onSubmit={handleConfigSave} className="space-y-10">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between px-1">
                                        <Label htmlFor="earnRate" className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                            <TrendingUp className="h-3 w-3" /> Base Earn Rate
                                        </Label>
                                        <Badge className="bg-primary/10 text-primary border-none font-black text-[10px]">{Math.floor(config.earnRatePercentage * 100)}%</Badge>
                                    </div>
                                    <div className="relative group">
                                        <Input
                                            id="earnRate"
                                            type="number"
                                            step="0.01"
                                            className="h-16 rounded-2xl border-slate-100 bg-slate-50 focus:bg-white transition-all text-xl font-black px-6"
                                            value={config.earnRatePercentage || ''}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setConfig({ ...config, earnRatePercentage: val === '' ? 0 : parseFloat(val) });
                                            }}
                                        />
                                        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300 font-black">X</div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <Label htmlFor="maxRedeem" className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 px-1">
                                        <Percent className="h-3 w-3" /> Redemption Cap
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="maxRedeem"
                                            type="number"
                                            step="0.01"
                                            className="h-16 rounded-2xl border-slate-100 bg-slate-50 focus:bg-white transition-all text-xl font-black px-6"
                                            value={config.maxRedeemPercentage || ''}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setConfig({ ...config, maxRedeemPercentage: val === '' ? 0 : parseFloat(val) });
                                            }}
                                        />
                                        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300 font-black">%</div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <Label htmlFor="expiry" className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 px-1">
                                        <Clock className="h-3 w-3" /> Expiry Engine
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="expiry"
                                            type="number"
                                            className="h-16 rounded-2xl border-slate-100 bg-slate-50 focus:bg-white transition-all text-xl font-black px-6 uppercase"
                                            value={config.expiryMonths || ''}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setConfig({ ...config, expiryMonths: val === '' ? 0 : parseInt(val) });
                                            }}
                                        />
                                        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300 font-black text-xs uppercase tracking-widest">Months</div>
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full h-16 rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                    isLoading={saving}
                                >
                                    <Save className="mr-3 h-5 w-5" /> Deploy Constants
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <div className="p-8 bg-emerald-50/50 border border-emerald-100 rounded-[2.5rem] space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-100 rounded-xl">
                                <Shield className="h-4 w-4 text-emerald-600" />
                            </div>
                            <span className="text-xs font-black text-emerald-800 uppercase tracking-widest">Safety Protocol</span>
                        </div>
                        <p className="text-sm font-medium text-emerald-800/80 leading-relaxed">
                            Updates to <span className="text-emerald-950 font-black">Constants</span> are applied instantly across the entire transaction engine. Historical data remains locked for audit integrity.
                        </p>
                    </div>
                </div>

                {/* Tiers Section */}
                <div className="lg:col-span-8 space-y-10">
                    <div className="flex flex-wrap gap-3 mb-6 p-2 bg-slate-100/50 rounded-[2rem] border border-slate-100 overflow-x-auto whitespace-nowrap scrollbar-hide">
                        {tiers.map(tier => (
                            <button
                                key={tier.id}
                                onClick={() => setActiveTierId(tier.id)}
                                className={`px-8 py-4 rounded-[1.5rem] text-sm font-black transition-all duration-300 flex items-center gap-3 ${activeTierId === tier.id
                                    ? 'bg-white text-slate-900 shadow-xl shadow-slate-200 border border-slate-100 scale-105'
                                    : 'text-slate-400 hover:text-slate-600'
                                    }`}
                            >
                                <span className={`h-2 w-2 rounded-full ${activeTierId === tier.id ? 'bg-primary animate-pulse' : 'bg-slate-300'}`} />
                                {tier.name}
                            </button>
                        ))}
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTierId}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Card className="border-none shadow-2xl shadow-slate-200/60 rounded-[3rem] overflow-hidden bg-white">
                                <div className="grid md:grid-cols-5 h-full min-h-[500px]">
                                    {/* Sidebar: Tier Visual */}
                                    <div className="md:col-span-2 bg-slate-50 p-10 flex flex-col items-center justify-center text-center space-y-8 border-r border-slate-100">
                                        <div className="relative group">
                                            <div className="absolute -inset-6 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all duration-700" />
                                            <div className="h-32 w-32 rounded-[3.5rem] bg-white shadow-2xl flex items-center justify-center text-4xl font-black text-slate-900 relative z-10 border border-slate-100">
                                                {activeTier?.benefits?.icon || activeTier?.name[0]}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <h3 className="text-3xl font-black text-slate-900">{activeTier?.name} Status</h3>
                                            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Membership Tier Identity</p>
                                        </div>
                                        <div className="pt-6 w-full space-y-4">
                                            <div className="p-4 bg-white rounded-2xl border border-slate-100 flex items-center justify-between">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Earn Rate</span>
                                                <span className="text-lg font-black text-primary">{Math.floor((activeTier?.earnRate || 0) * 100)}%</span>
                                            </div>
                                            <div className="p-4 bg-white rounded-2xl border border-slate-100 flex items-center justify-between">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Entry Floor</span>
                                                <span className="text-lg font-black text-slate-900">₹{parseFloat(activeTier?.minSpend || 0).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Content: Edit Tier */}
                                    <div className="md:col-span-3 p-10 space-y-10">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Award className="h-5 w-5 text-slate-900" />
                                                <h4 className="text-lg font-black text-slate-900 uppercase tracking-tighter">Tier Configuration</h4>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="rounded-full font-black text-[10px] uppercase tracking-widest h-8 border-slate-200"
                                                onClick={() => handleTierSave(activeTier)}
                                            >
                                                Push Updates
                                            </Button>
                                        </div>

                                        <div className="grid grid-cols-2 gap-8">
                                            <div className="space-y-4">
                                                <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 px-1">Entry Threshold</Label>
                                                <div className="relative">
                                                    <Input
                                                        type="number"
                                                        className="h-14 rounded-2xl border-slate-100 bg-slate-50 font-black text-lg px-10"
                                                        value={activeTier?.minSpend || ''}
                                                        onChange={(e) => {
                                                            const val = e.target.value;
                                                            const numVal = val === '' ? 0 : parseFloat(val);
                                                            const updated = tiers.map(t => t.id === activeTierId ? { ...t, minSpend: isNaN(numVal) ? 0 : numVal } : t);
                                                            setTiers(updated);
                                                        }}
                                                    />
                                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</div>
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 px-1">Tier Multiplier</Label>
                                                <div className="relative">
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        className="h-14 rounded-2xl border-slate-100 bg-slate-50 font-black text-lg px-6"
                                                        value={activeTier?.earnRate || ''}
                                                        onChange={(e) => {
                                                            const val = e.target.value;
                                                            const numVal = val === '' ? 0 : parseFloat(val);
                                                            const updated = tiers.map(t => t.id === activeTierId ? { ...t, earnRate: isNaN(numVal) ? 0 : numVal } : t);
                                                            setTiers(updated);
                                                        }}
                                                    />
                                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 font-black">%</div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 px-1 flex items-center justify-between">
                                                Membership Benefits
                                                <span className="text-[9px] lowercase text-slate-300">comma separated values</span>
                                            </Label>
                                            <div className="relative group">
                                                <div className="absolute left-4 top-4">
                                                    <ListChecks className="h-5 w-5 text-slate-300" />
                                                </div>
                                                <textarea
                                                    className="w-full min-h-[140px] rounded-3xl border-slate-100 bg-slate-50 p-6 pl-12 text-sm font-bold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all resize-none leading-relaxed"
                                                    value={activeTier?.benefits?.list?.join(', ')}
                                                    onChange={(e) => {
                                                        const list = e.target.value.split(',').map(s => s.trim()).filter(s => s !== '');
                                                        const updated = tiers.map(t => t.id === activeTierId ? { ...t, benefits: { ...t.benefits, list } } : t);
                                                        setTiers(updated);
                                                    }}
                                                    placeholder="Enter benefits separated by commas..."
                                                />
                                            </div>
                                        </div>

                                        <div className="pt-2">
                                            <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-4">Preview on Frontend</div>
                                            <div className="flex flex-wrap gap-2">
                                                {activeTier?.benefits?.list?.map((benefit, i) => (
                                                    <Badge key={i} variant="secondary" className="bg-slate-100 text-slate-600 border-none font-bold py-1.5 px-4 rounded-full text-[10px]">
                                                        {benefit}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    </AnimatePresence>

                    <div className="bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl group">
                        <div className="absolute -right-20 -top-20 h-64 w-64 bg-primary/20 rounded-full blur-3xl group-hover:bg-primary/30 transition-all duration-700" />
                        <div className="relative z-10 flex items-center justify-between">
                            <div className="space-y-6 max-w-sm">
                                <div className="p-3 bg-white/10 rounded-2xl w-fit">
                                    <Info className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="text-3xl font-black">Optimization Engine</h3>
                                <p className="text-slate-400 font-medium leading-relaxed">
                                    Your loyalty engine has been upgraded to support <span className="text-white">Tier-Specific Multipliers</span>.
                                    Users transition through levels automatically as their total verified spend hits the Entry Floors set above.
                                </p>
                                <Button className="bg-white text-slate-900 hover:bg-slate-100 rounded-full font-black text-xs uppercase tracking-widest px-8">
                                    View Logic Documentation <ArrowUpRight className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                            <div className="hidden md:block">
                                <motion.div
                                    className="p-12 bg-white/5 rounded-full border border-white/10"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                                >
                                    <Star className="h-20 w-20 text-primary opacity-50" />
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default AdminSettings;
