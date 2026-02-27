import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { CreditCard, Gift, TrendingUp, Calendar, ArrowRight, Shield, Star, Info, CheckCircle, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../components/ui/Table";
import TierProgressCard from '../components/loyalty/TierProgressCard';

const StatCard = ({ title, value, icon: Icon, description, className, footer }) => (
    <Card className={className + " shadow-sm border-slate-100 overflow-hidden relative"}>
        <div className="absolute top-0 right-0 p-4 opacity-10">
            <Icon size={48} className="text-slate-900" />
        </div>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-400">
                {title}
            </CardTitle>
        </CardHeader>
        <CardContent>
            <div className="text-3xl font-extrabold text-slate-900 mb-1">{value}</div>
            <p className="text-[13px] font-medium text-slate-500 mb-2">
                {description}
            </p>
            {footer && <div className="mt-4 pt-4 border-t border-slate-50">{footer}</div>}
        </CardContent>
    </Card>
);

const Dashboard = () => {
    const { user } = useAuth();
    const [recentTransactions, setRecentTransactions] = useState([]);
    const [loyaltyData, setLoyaltyData] = useState({ tiers: [], config: null });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [txnsRes, configRes, tiersRes] = await Promise.all([
                    api.get('/transactions'),
                    api.get('/admin/config'),
                    api.get('/admin/tiers')
                ]);
                setRecentTransactions(txnsRes.data.slice(0, 5));
                setLoyaltyData({
                    config: configRes.data,
                    tiers: tiersRes.data
                });
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const currentTier = loyaltyData.tiers.find(t => t.name === user?.tier);

    const maxRedeemAmount = loyaltyData.config
        ? Math.floor(user?.availablePoints * parseFloat(loyaltyData.config.maxRedeemPercentage))
        : 0;

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    if (loading) return <div className="p-8 text-center text-slate-400 font-bold uppercase tracking-widest">Loading Dashboard...</div>;

    return (
        <motion.div
            className="space-y-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <div className="flex flex-col md:flex-row justify-between md:items-end gap-4 mb-2">
                <div>
                    <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-1">Overview</h2>
                    <p className="text-slate-500 font-medium">
                        Welcome back, <span className="text-slate-900 font-bold">{user?.name}</span>. Here's your current loyalty status.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="rounded-xl border-slate-200" asChild>
                        <Link to="/transactions">Activity</Link>
                    </Button>
                    <Button className="rounded-xl shadow-lg shadow-primary/20" asChild>
                        <Link to="/rewards">Redeem Rewards</Link>
                    </Button>
                </div>
            </div>

            {/* Loyalty Tier Progress */}
            <motion.div variants={itemVariants}>
                <TierProgressCard />
            </motion.div>

            <motion.div variants={itemVariants} className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Available Points"
                    value={user?.availablePoints || 0}
                    icon={Gift}
                    description="Current redeemable balance"
                    footer={
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-400">REDEMPTION CAP</span>
                            <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-none font-black text-[10px]">
                                {maxRedeemAmount} PTS MAX
                            </Badge>
                        </div>
                    }
                />
                <StatCard
                    title="Lifetime Earnings"
                    value={user?.totalPoints || 0}
                    icon={TrendingUp}
                    description="Cumulative points history"
                />
                <StatCard
                    title="Account Level"
                    value={user?.tier || 'Silver'}
                    icon={Shield}
                    description="Membership classification"
                />
                <StatCard
                    title="Member Rank"
                    value={`#${Math.floor(Math.random() * 500) + 1}`}
                    icon={Star}
                    description="Global member ranking"
                />
            </motion.div>

            <motion.div variants={itemVariants} className="grid gap-6 md:grid-cols-7">
                <Card className="col-span-4 border-slate-100 shadow-sm rounded-2xl overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between bg-slate-50/50 border-b border-slate-100">
                        <div>
                            <CardTitle className="text-lg font-extrabold text-slate-900">Recent Ledger Activity</CardTitle>
                            <CardDescription className="font-medium text-slate-500">First-In, First-Out point tracking.</CardDescription>
                        </div>
                        <Button asChild variant="ghost" size="sm" className="font-bold text-primary hover:text-primary hover:bg-primary/5">
                            <Link to="/transactions">
                                Full History
                                <ChevronRight className="h-4 w-4 ml-1" />
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent border-slate-50">
                                    <TableHead className="font-black text-[10px] uppercase tracking-widest pl-8">Description</TableHead>
                                    <TableHead className="text-right font-black text-[10px] uppercase tracking-widest">Date</TableHead>
                                    <TableHead className="text-right font-black text-[10px] uppercase tracking-widest">Amount</TableHead>
                                    <TableHead className="text-right font-black text-[10px] uppercase tracking-widest pr-8">Points</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentTransactions.length > 0 ? (
                                    recentTransactions.map((txn) => (
                                        <TableRow key={txn.id || Math.random()} className="hover:bg-slate-50 transition-colors border-slate-50">
                                            <TableCell className="font-bold text-slate-700 pl-8">{txn.description}</TableCell>
                                            <TableCell className="text-right text-slate-400 font-medium">
                                                {txn.createdAt ? new Date(txn.createdAt).toLocaleDateString() : 'N/A'}
                                            </TableCell>
                                            <TableCell className="text-right font-bold text-slate-900">₹{txn.amount}</TableCell>
                                            <TableCell className="text-right pr-8">
                                                <span className="text-emerald-600 font-black">+{txn.pointsEarned}</span>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-40 text-center text-slate-400 font-bold uppercase tracking-widest">
                                            No recent activity found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Card className="col-span-3 border-slate-100 shadow-sm rounded-2xl overflow-hidden">
                    <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                        <CardTitle className="text-lg font-extrabold text-slate-900">Tier Privileges</CardTitle>
                        <CardDescription className="font-medium text-slate-500 text-xs">Benefits for {user?.tier} members.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="space-y-4">
                            {currentTier?.benefits ? Object.entries(currentTier.benefits).map(([key, val], i) => (
                                <div key={i} className="flex items-start gap-4 p-4 rounded-xl border border-slate-50 bg-white hover:border-primary/20 transition-all group">
                                    <div className="h-10 w-10 shrink-0 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                        <CheckCircle size={20} />
                                    </div>
                                    <div>
                                        <div className="text-sm font-black text-slate-900 uppercase tracking-tight mb-1">{key}</div>
                                        <div className="text-xs text-slate-500 font-medium leading-relaxed">{val}</div>
                                    </div>
                                </div>
                            )) : <p className="text-center p-8 text-slate-400 font-bold uppercase tracking-widest">No benefits defined.</p>}
                        </div>
                        <Button variant="outline" className="w-full mt-6 rounded-xl border-slate-200 font-bold text-slate-600 hover:text-primary" asChild>
                            <Link to="/rewards">
                                <Gift className="mr-2 h-4 w-4" /> Browse Catalog
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </motion.div>
        </motion.div>
    );
};

export default Dashboard;
