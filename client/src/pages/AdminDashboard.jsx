import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Users, CreditCard, Gift, TrendingUp, BarChart3, ArrowRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/admin/dashboard');
                setStats(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const chartData = [
        { name: 'Issued', points: stats?.totalPointsIssued || 0 },
        { name: 'Redeemed', points: stats?.totalPointsRedeemed || 0 },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[50vh]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <motion.div
            className="space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Admin Overview</h2>
                    <p className="text-muted-foreground">
                        System performance and loyalty program statistics.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" asChild>
                        <Link to="/admin/reports">
                            <BarChart3 className="mr-2 h-4 w-4" />
                            View Reports
                        </Link>
                    </Button>
                </div>
            </div>

            <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.userCount || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            Active loyalty members
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Transactions</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.transactionCount || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            Total processed
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Redemptions</CardTitle>
                        <Gift className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.redemptionCount || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            Rewards claimed
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Points Liability</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {(stats?.totalPointsIssued - stats?.totalPointsRedeemed).toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Outstanding points
                        </p>
                    </CardContent>
                </Card>
            </motion.div>

            <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Points Overview</CardTitle>
                        <CardDescription>
                            Comparison of points issued vs redeemed.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                    <XAxis
                                        dataKey="name"
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => `${value}`}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'transparent' }}
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                return (
                                                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <div className="flex flex-col">
                                                                <span className="text-[0.70rem] uppercase text-muted-foreground">
                                                                    {payload[0].payload.name}
                                                                </span>
                                                                <span className="font-bold text-muted-foreground">
                                                                    {payload[0].value}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            }
                                            return null
                                        }}
                                    />
                                    <Bar dataKey="points" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Management</CardTitle>
                        <CardDescription>
                            Quick access to administrative tasks.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <Button variant="secondary" className="w-full justify-between" asChild>
                            <Link to="/admin/rewards">
                                <span className="flex items-center gap-2">
                                    <Gift className="h-4 w-4" />
                                    Manage Rewards Inventory
                                </span>
                                <ArrowRight className="h-4 w-4 opacity-50" />
                            </Link>
                        </Button>
                        <Button variant="secondary" className="w-full justify-between" asChild>
                            <Link to="/admin/reports">
                                <span className="flex items-center gap-2">
                                    <BarChart3 className="h-4 w-4" />
                                    Generate Reports
                                </span>
                                <ArrowRight className="h-4 w-4 opacity-50" />
                            </Link>
                        </Button>
                        <Button variant="secondary" className="w-full justify-between" asChild>
                            <Link to="/signup">
                                <span className="flex items-center gap-2">
                                    <Users className="h-4 w-4" />
                                    Register New User (Manual)
                                </span>
                                <ArrowRight className="h-4 w-4 opacity-50" />
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </motion.div>
        </motion.div>
    );
};

export default AdminDashboard;
