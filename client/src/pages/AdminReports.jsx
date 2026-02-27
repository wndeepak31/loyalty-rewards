import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../components/ui/Table";

const AdminReports = () => {
    const [data, setData] = useState({ topUsers: [], recentRedemptions: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get('/admin/reports');
                setData(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">System Reports</h1>
                    <p className="text-muted-foreground">Detailed system activity and user insights</p>
                </div>
                <Button variant="outline" onClick={() => window.print()}>
                    <Download className="mr-2 h-4 w-4" />
                    Export / Print
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Users */}
                <Card>
                    <CardHeader>
                        <CardTitle>Top Users</CardTitle>
                        <CardDescription>Ranked by current points balance.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px]">#</TableHead>
                                    <TableHead>User</TableHead>
                                    <TableHead className="text-right">Available</TableHead>
                                    <TableHead className="text-right">Total</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow><TableCell colSpan={4} className="text-center">Loading...</TableCell></TableRow>
                                ) : data.topUsers.length > 0 ? (
                                    data.topUsers.map((user, index) => (
                                        <TableRow key={user.id}>
                                            <TableCell className="text-muted-foreground font-medium">{index + 1}</TableCell>
                                            <TableCell>
                                                <div className="font-medium">{user.name}</div>
                                                <div className="text-xs text-muted-foreground">{user.email}</div>
                                            </TableCell>
                                            <TableCell className="text-right font-bold text-primary">
                                                {user.availablePoints.toLocaleString()}
                                            </TableCell>
                                            <TableCell className="text-right text-muted-foreground">
                                                {user.totalPoints.toLocaleString()}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">No users found</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Recent Redemptions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Redemptions</CardTitle>
                        <CardDescription>Latest reward claims by users.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Reward</TableHead>
                                    <TableHead className="text-right">Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow><TableCell colSpan={3} className="text-center">Loading...</TableCell></TableRow>
                                ) : data.recentRedemptions.length > 0 ? (
                                    data.recentRedemptions.map((redemption) => (
                                        <TableRow key={redemption.id}>
                                            <TableCell className="font-medium">
                                                {redemption.user?.name || 'Unknown'}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {redemption.reward?.name || 'Unknown Reward'}
                                            </TableCell>
                                            <TableCell className="text-right text-muted-foreground">
                                                {new Date(redemption.createdAt).toLocaleDateString()}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground">No redemptions found</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AdminReports;
