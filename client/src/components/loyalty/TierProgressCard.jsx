import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Award, Zap, Info } from 'lucide-react';
import api from '../../services/api';

const TierProgressCard = () => {
    const [progressData, setProgressData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProgress = async () => {
            try {
                const response = await api.get('/loyalty/tier-progress');
                setProgressData(response.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching tier progress:', err);
                setError('Failed to load tier progress');
                setLoading(false);
            }
        };

        fetchProgress();
    }, []);

    if (loading) {
        return (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-6"></div>
                <div className="h-4 bg-gray-200 rounded-full w-full mb-2"></div>
                <div className="flex justify-between">
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-red-100 flex items-center gap-4 text-red-600">
                <div className="p-2 bg-red-50 rounded-lg">
                    <Info className="w-5 h-5" />
                </div>
                <div>
                    <p className="text-sm font-bold">Unable to load tier progress</p>
                    <p className="text-xs opacity-80">{error}</p>
                </div>
            </div>
        );
    }

    if (!progressData) return null;

    const {
        currentTier,
        nextTier,
        currentSpend,
        nextThreshold,
        remainingAmount,
        progressPercentage
    } = progressData;

    const isHighestTier = !nextTier;

    return (
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 relative overflow-hidden group transition-all duration-300 hover:shadow-md">
            {/* Elegant Background Accent */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-50/30 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-emerald-100/40 transition-colors duration-500"></div>

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600 shadow-sm shadow-emerald-100/50">
                            <Award className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-0.5">Membership Status</span>
                            <h3 className="text-2xl font-black text-slate-900 leading-tight">{currentTier}</h3>
                        </div>
                    </div>
                    {!isHighestTier && (
                        <div className="text-right">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-0.5">Target</span>
                            <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl text-xs font-bold ring-1 ring-emerald-100/50">
                                <Zap className="w-3.5 h-3.5 fill-current" />
                                {nextTier}
                            </div>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-1.5">
                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Annual Qualifying Spend</div>
                            <div className="group/info relative">
                                <Info className="w-3 h-3 text-slate-300 cursor-help" />
                                <div className="absolute bottom-full left-0 mb-2 w-48 p-2 bg-slate-900 text-white text-[10px] rounded-lg opacity-0 group-hover/info:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
                                    Resets annually. Determines your membership tier for the current year.
                                </div>
                            </div>
                        </div>
                        <div className="text-4xl font-black text-slate-900 flex items-baseline gap-1">
                            <span className="text-2xl font-extrabold text-slate-400">₹</span>
                            {currentSpend.toLocaleString()}
                        </div>
                    </div>
                    <div className="flex flex-col justify-end md:text-right">
                        {!isHighestTier ? (
                            <p className="text-sm font-semibold text-slate-600 leading-relaxed">
                                You are <span className="text-emerald-600 font-bold">₹{remainingAmount.toLocaleString()}</span> away from <span className="text-slate-900 font-black">{nextTier}</span>
                            </p>
                        ) : (
                            <div className="flex items-center md:justify-end gap-2 text-sm font-black text-emerald-600 bg-emerald-50 w-fit md:ml-auto px-4 py-2 rounded-2xl ring-1 ring-emerald-100">
                                <Award className="w-4 h-4" />
                                You have reached our highest membership tier
                            </div>
                        )}
                    </div>
                </div>

                <div className="relative">
                    <div className="overflow-hidden h-3 mb-4 text-xs flex rounded-full bg-slate-100 ring-4 ring-slate-50">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercentage}%` }}
                            transition={{ duration: 1.5, ease: [0.34, 1.56, 0.64, 1] }}
                            className="shadow-lg flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 relative overflow-hidden"
                        >
                            {/* Glossy Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent"></div>
                        </motion.div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex flex-col items-start">
                            <span className="text-xs font-black text-slate-900 tracking-tight">{currentTier}</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Current</span>
                        </div>

                        {!isHighestTier && (
                            <>
                                <div className="flex-1 mx-4 h-px bg-slate-100 border-b border-dashed border-slate-200"></div>
                                <div className="flex flex-col items-end">
                                    <span className="text-xs font-black text-slate-900 tracking-tight">{nextTier}</span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Next Goal</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TierProgressCard;
