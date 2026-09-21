import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Gift, Archive, Info, AlertTriangle, CheckCircle, ChevronRight, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

const Rewards = () => {
    const { user } = useAuth();
    const [rewards, setRewards] = useState([]);
    const [loyaltyConfig, setLoyaltyConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [redeeming, setRedeeming] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [rewardsRes, configRes] = await Promise.all([
                    api.get('/rewards'),
                    api.get('/admin/config')
                ]);
                setRewards(rewardsRes.data);
                setLoyaltyConfig(configRes.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleRedeem = async (reward) => {
        if (!confirm(`Redeem "${reward.name}" for ${reward.pointsCost} points?`)) return;

        setRedeeming(reward.id);
        try {
            await api.post('/redemptions', { rewardId: reward.id });
            alert('Congratulations! Reward redeemed successfully.');
            window.location.reload();
        } catch (err) {
            const msg = err.response?.data?.msg || 'Redemption failed';
            alert(msg);
        } finally {
            setRedeeming(null);
        }
    };

    const maxRedeemLimit = loyaltyConfig && user
        ? Math.floor(user.availablePoints * parseFloat(loyaltyConfig.maxRedeemPercentage))
        : 0;

    if (loading) return <div className="p-12 text-center text-slate-400 font-black uppercase tracking-widest">Loading Boutique...</div>;

    return (
        <div className="space-y-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2">Rewards Boutique</h1>
                    <p className="text-slate-500 font-medium">Exquisite offerings for our most valued members.</p>
                </div>
                <Card className="bg-white border-slate-100 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
                    <CardContent className="p-6 flex items-center gap-6">
                        <div className="flex flex-col">
                            <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Available Points</span>
                            <span className="text-2xl font-black text-primary">{user?.availablePoints}</span>
                        </div>
                        <div className="h-10 w-px bg-slate-100 mx-2" />
                        <div className="flex flex-col">
                            <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Max Redemption</span>
                            <span className="text-xl font-black text-brand-600">{maxRedeemLimit} <span className="text-xs">PTS</span></span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Config alert */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-brand-50/60 border border-brand-200/70 rounded-2xl p-5 flex gap-4 text-sm text-brand-900 shadow-sm"
            >
                <div className="bg-white rounded-xl p-2 shadow-sm shrink-0 h-fit">
                    <Info size={20} className="text-brand-600" />
                </div>
                <div className="font-medium leading-relaxed">
                    <span className="font-black text-brand-700 uppercase tracking-tight mr-2">Enterprise Policy:</span>
                    To maintain balance stability, members can redeem up to <span className="font-bold">{loyaltyConfig?.maxRedeemPercentage * 100}%</span> of their current balance per request. This ensures high-value liquidity for all members.
                </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {rewards.map((reward, i) => {
                    const canAfford = user?.availablePoints >= reward.pointsCost;
                    const withinLimit = reward.pointsCost <= maxRedeemLimit;
                    const inStock = reward.stock === -1 || reward.stock > 0;
                    const isRedeemable = canAfford && withinLimit && inStock;

                    return (
                        <motion.div
                            key={reward.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                        >
                            <Card className={`flex flex-col h-full border-slate-100 overflow-hidden transition-all duration-500 rounded-[2rem] group ${!isRedeemable ? 'opacity-80' : 'hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-2'}`}>
                                <div className="relative h-64 w-full overflow-hidden bg-slate-100">
                                    {reward.imageUrl ? (
                                        <img
                                            src={reward.imageUrl}
                                            alt={reward.name}
                                            className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center text-slate-200">
                                            <Gift size={64} className="opacity-50" />
                                        </div>
                                    )}
                                    <div className="absolute top-6 right-6">
                                        <Badge className={`px-4 py-1.5 rounded-full font-black text-[10px] uppercase border-none shadow-lg ${inStock ? "bg-white text-slate-900" : "bg-red-500 text-white"}`}>
                                            {inStock ? (reward.stock === -1 ? 'Available' : `${reward.stock} Left`) : 'Out of Stock'}
                                        </Badge>
                                    </div>
                                    <div className="absolute bottom-4 left-6">
                                        <div className="bg-primary text-white text-xl font-black px-5 py-2 rounded-2xl shadow-xl shadow-brand-500/20">
                                            {reward.pointsCost} <span className="text-xs font-bold uppercase opacity-80">pts</span>
                                        </div>
                                    </div>
                                </div>

                                <CardHeader className="pt-8 px-8 pb-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <CardTitle className="text-2xl font-black text-slate-900 line-clamp-1">{reward.name}</CardTitle>
                                    </div>
                                    <CardDescription className="text-[15px] font-medium text-slate-500 line-clamp-2 leading-relaxed">
                                        {reward.description}
                                    </CardDescription>
                                </CardHeader>

                                <CardContent className="px-8 flex-grow pt-0">
                                    <div className="space-y-3 mt-4">
                                        {!canAfford && (
                                            <div className="flex items-center gap-2 text-xs font-bold text-red-600 bg-red-50/50 p-2 rounded-xl border border-red-100">
                                                <AlertTriangle size={14} /> Need {reward.pointsCost - user?.availablePoints} more points
                                            </div>
                                        )}
                                        {canAfford && !withinLimit && (
                                            <div className="flex items-center gap-2 text-xs font-bold text-amber-600 bg-amber-50/50 p-2 rounded-xl border border-amber-100">
                                                <AlertTriangle size={14} /> Exceeds {loyaltyConfig?.maxRedeemPercentage * 100}% limit
                                            </div>
                                        )}
                                        {isRedeemable && (
                                            <div className="flex items-center gap-2 text-xs font-black text-brand-600 uppercase tracking-tight bg-brand-50/60 p-2 rounded-xl border border-brand-200/60">
                                                <CheckCircle size={14} /> Eligible for Redemption
                                            </div>
                                        )}
                                    </div>
                                </CardContent>

                                <CardFooter className="p-8 pt-4">
                                    <Button
                                        className={`w-full h-14 rounded-2xl font-black text-base transition-all duration-300 ${isRedeemable ? 'shadow-lg shadow-primary/20 hover:scale-[1.02]' : 'bg-slate-100 text-slate-400 hover:bg-slate-100'}`}
                                        disabled={!isRedeemable || redeeming === reward.id}
                                        isLoading={redeeming === reward.id}
                                        onClick={() => handleRedeem(reward)}
                                    >
                                        {inStock ? (isRedeemable ? 'Redeem Now' : 'Check Eligibility') : 'Out of Stock'}
                                    </Button>
                                </CardFooter>
                            </Card>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};

export default Rewards;
