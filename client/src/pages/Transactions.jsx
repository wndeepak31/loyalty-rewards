import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Plus, Search, Calendar, CreditCard, ArrowUpRight, ChevronRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
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

const Transactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newTxn, setNewTxn] = useState({ amount: '', description: '' });
    const [searchTerm, setSearchTerm] = useState('');

    const fetchTransactions = async () => {
        try {
            const res = await api.get('/transactions');
            setTransactions(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    const handleAddTransaction = async (e) => {
        e.preventDefault();
        try {
            await api.post('/transactions', newTxn);
            setShowModal(false);
            setNewTxn({ amount: '', description: '' });
            fetchTransactions();
            setTimeout(() => window.location.reload(), 500);
        } catch (err) {
            alert('Failed to add transaction');
        }
    };

    const filteredTransactions = transactions.filter(txn =>
        txn.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        txn.id.toString().includes(searchTerm)
    );

    if (loading) return <div className="p-12 text-center text-slate-400 font-black uppercase tracking-widest">Loading Ledger...</div>;

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2">Activity Ledger</h1>
                    <p className="text-slate-500 font-medium">Historical record of all your purchases and points earned.</p>
                </div>
                <Button className="rounded-[1.5rem] h-14 px-8 font-black text-base shadow-lg shadow-primary/20" onClick={() => setShowModal(true)}>
                    <Plus className="mr-2 h-5 w-5" />
                    Log Purchase
                </Button>
            </div>

            <Card className="border-slate-100 shadow-sm rounded-[2rem] overflow-hidden bg-white">
                <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-8 border-b border-slate-50">
                    <div>
                        <CardTitle className="text-xl font-black text-slate-900">Purchase History</CardTitle>
                        <CardDescription className="text-sm font-medium text-slate-400">Search through your accumulated wealth.</CardDescription>
                    </div>
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            type="search"
                            placeholder="Find a transaction..."
                            className="h-12 pl-11 rounded-2xl border-slate-100 bg-slate-50 focus:bg-white transition-all font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent border-slate-50">
                                <TableHead className="font-black text-[10px] uppercase tracking-widest pl-8 py-4">Ref ID</TableHead>
                                <TableHead className="font-black text-[10px] uppercase tracking-widest py-4">Description</TableHead>
                                <TableHead className="font-black text-[10px] uppercase tracking-widest py-4">Timestamp</TableHead>
                                <TableHead className="text-right font-black text-[10px] uppercase tracking-widest py-4">Value</TableHead>
                                <TableHead className="text-right font-black text-[10px] uppercase tracking-widest pr-8 py-4">Points Earned</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredTransactions.length > 0 ? (
                                filteredTransactions.map((txn) => (
                                    <TableRow key={txn.id} className="hover:bg-slate-50 transition-colors border-slate-50">
                                        <TableCell className="pl-8 py-6">
                                            <span className="font-black text-slate-300 text-xs">#{txn.id}</span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-black text-slate-900 text-base">{txn.description}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-slate-500 font-bold text-sm">
                                                <Calendar className="h-3.5 w-3.5" />
                                                {new Date(txn.createdAt).toLocaleDateString()}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right font-black text-slate-900">
                                            ₹{parseFloat(txn.amount).toLocaleString()}
                                        </TableCell>
                                        <TableCell className="text-right pr-8">
                                            <Badge variant="secondary" className="bg-brand-50 text-brand-700 hover:bg-brand-100 border border-brand-200/60 px-3 py-1 rounded-full font-black text-sm gap-1">
                                                <ArrowUpRight className="h-3.5 w-3.5" />
                                                +{txn.pointsEarned}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-64 text-center">
                                        <div className="flex flex-col items-center gap-4 text-slate-400">
                                            <CreditCard size={48} className="opacity-20" />
                                            <div className="font-black uppercase tracking-widest">No matching activities.</div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Add Transaction Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="w-full max-w-lg"
                        >
                            <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden">
                                <CardHeader className="p-10 pb-6 relative">
                                    <button
                                        onClick={() => setShowModal(false)}
                                        className="absolute right-8 top-8 p-2 rounded-full hover:bg-slate-50 text-slate-400 transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                    <CardTitle className="text-3xl font-black text-slate-900">Log Purchase</CardTitle>
                                    <CardDescription className="text-base font-medium text-slate-500 mt-2">Earn points for your new exquisite acquisition.</CardDescription>
                                </CardHeader>
                                <form onSubmit={handleAddTransaction}>
                                    <CardContent className="px-10 space-y-8">
                                        <div className="space-y-3">
                                            <Label htmlFor="amount" className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Transaction Value (₹)</Label>
                                            <div className="relative group">
                                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 font-black text-xl">₹</div>
                                                <Input
                                                    id="amount"
                                                    type="number"
                                                    step="0.01"
                                                    className="h-16 pl-12 rounded-2xl border-slate-100 bg-slate-50 focus:bg-white transition-all text-xl font-black"
                                                    value={newTxn.amount}
                                                    onChange={(e) => setNewTxn({ ...newTxn, amount: e.target.value })}
                                                    required
                                                    min="1"
                                                    placeholder="0.00"
                                                />
                                            </div>
                                            <p className="text-xs text-slate-400 font-bold px-1">
                                                Estimated earnings: <span className="text-primary font-black">{(newTxn.amount || 0) * 0.1} points</span>
                                            </p>
                                        </div>
                                        <div className="space-y-3">
                                            <Label htmlFor="description" className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Item Description</Label>
                                            <Input
                                                id="description"
                                                type="text"
                                                className="h-16 rounded-2xl border-slate-100 bg-slate-50 focus:bg-white transition-all font-bold text-lg"
                                                value={newTxn.description}
                                                onChange={(e) => setNewTxn({ ...newTxn, description: e.target.value })}
                                                placeholder="e.g. Diamond Solitaire Necklace"
                                                required
                                            />
                                        </div>
                                    </CardContent>
                                    <div className="p-10 pt-4 flex flex-col gap-4">
                                        <Button type="submit" className="h-16 rounded-[2rem] text-lg font-black shadow-xl shadow-primary/20">
                                            Record Acquisition
                                        </Button>
                                    </div>
                                </form>
                            </Card>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Transactions;
