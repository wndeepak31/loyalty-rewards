import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { History, CheckCircle, Clock, XCircle, Gift, ChevronRight, AlertCircle, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../components/ui/Table";
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

const Redemptions = () => {
    const [redemptions, setRedemptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchRedemptions = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get('/redemptions');
            console.log("Redemptions response:", res.data);
            setRedemptions(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("Redemptions Fetch Error:", err);
            setError(err.response?.data?.msg || 'Failed to connect to the rewards engine. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRedemptions();
    }, []);

    const getStatusBadge = (status) => {
        switch (status) {
            case 'fulfilled':
                return (
                    <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-100 px-3 py-1 rounded-full font-bold gap-1.5 shadow-sm">
                        <CheckCircle className="h-3.5 w-3.5" /> Fulfilled
                    </Badge>
                );
            case 'cancelled':
                return (
                    <Badge className="bg-red-50 text-red-700 hover:bg-red-100 border-red-100 px-3 py-1 rounded-full font-bold gap-1.5 shadow-sm">
                        <XCircle className="h-3.5 w-3.5" /> Cancelled
                    </Badge>
                );
            default:
                return (
                    <Badge className="bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-100 px-3 py-1 rounded-full font-bold gap-1.5 shadow-sm">
                        <Clock className="h-3.5 w-3.5" /> Pending
                    </Badge>
                );
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-24 text-center">
                <div className="h-10 w-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
                <div className="text-slate-400 font-black uppercase tracking-widest text-sm">Synchronizing Ledger...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                    <div>
                        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2">Redemption History</h1>
                        <p className="text-slate-500 font-medium">History of premium rewards you've claimed</p>
                    </div>
                </div>
                <Card className="border-red-100 bg-red-50/30 shadow-sm rounded-3xl p-12 text-center">
                    <CardContent className="flex flex-col items-center gap-6 p-0">
                        <div className="bg-white p-4 rounded-2xl shadow-sm">
                            <AlertCircle size={40} className="text-red-500" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-900 mb-2">Sync Interrupted</h3>
                            <p className="text-slate-500 font-medium max-w-md mx-auto">{error}</p>
                        </div>
                        <Button onClick={fetchRedemptions} className="rounded-xl px-8 h-12">
                            <RefreshCw className="mr-2 h-4 w-4" /> Retry Connection
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2">Redemption History</h1>
                    <p className="text-slate-500 font-medium">History of premium rewards you've claimed</p>
                </div>
            </div>

            <Card className="border-slate-100 shadow-sm rounded-3xl overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-8 py-6">
                    <CardTitle className="text-xl font-extrabold text-slate-900">Your Claims</CardTitle>
                    <CardDescription className="font-medium text-slate-500">Track the status of your bespoke reward requests.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent border-slate-50">
                                <TableHead className="font-black text-[10px] uppercase tracking-widest pl-8 py-4">Reward Detail</TableHead>
                                <TableHead className="font-black text-[10px] uppercase tracking-widest py-4">Processed Date</TableHead>
                                <TableHead className="font-black text-[10px] uppercase tracking-widest py-4">Status</TableHead>
                                <TableHead className="text-right font-black text-[10px] uppercase tracking-widest pr-8 py-4">Points Deduction</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {redemptions.length > 0 ? (
                                redemptions.map((item) => (
                                    <TableRow key={item.id} className="hover:bg-slate-50 transition-colors border-slate-50">
                                        <TableCell className="pl-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-2xl bg-slate-50 overflow-hidden flex items-center justify-center shrink-0 border border-slate-200/50 shadow-sm">
                                                    {item.reward?.imageUrl ? (
                                                        <img src={item.reward.imageUrl} alt="" className="h-full w-full object-cover" />
                                                    ) : (
                                                        <Gift className="h-6 w-6 text-slate-300" />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-black text-slate-900 text-base">{item.reward?.name || 'Boutique Item'}</div>
                                                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{item.reward?.category || 'Exclusive'}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-slate-500 font-bold text-sm">
                                            {item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Pending...'}
                                        </TableCell>
                                        <TableCell>
                                            {getStatusBadge(item.status)}
                                        </TableCell>
                                        <TableCell className="text-right pr-8 py-5">
                                            <div className="text-red-600 font-black text-lg">-{item.pointsSpent}</div>
                                            <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Points Spent</div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-64 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="bg-slate-50 p-6 rounded-full">
                                                <History size={48} className="text-slate-200" />
                                            </div>
                                            <div className="text-slate-400 font-black uppercase tracking-widest">No redemptions found.</div>
                                            <Button variant="outline" className="rounded-xl" asChild>
                                                <Link to="/rewards">Claim your first reward</Link>
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default Redemptions;
