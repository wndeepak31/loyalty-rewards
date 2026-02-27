import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Edit, Trash2, Plus, X, Image as ImageIcon } from 'lucide-react';
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

const AdminRewards = () => {
    const [rewards, setRewards] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingReward, setEditingReward] = useState(null);

    const initialFormState = {
        name: '',
        description: '',
        pointsCost: '',
        stock: '',
        category: '',
        imageUrl: '',
        isActive: true
    };

    const [formData, setFormData] = useState(initialFormState);

    const fetchRewards = async () => {
        try {
            const res = await api.get('/rewards');
            setRewards(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchRewards();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingReward) {
                await api.put(`/rewards/${editingReward.id}`, formData);
            } else {
                await api.post('/rewards', formData);
            }
            setShowModal(false);
            setEditingReward(null);
            setFormData(initialFormState);
            fetchRewards();
        } catch (err) {
            alert('Operation failed');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Deactivate this reward?')) return;
        try {
            await api.delete(`/rewards/${id}`);
            fetchRewards();
        } catch (error) {
            alert('Failed to delete');
        }
    };

    const openEdit = (reward) => {
        setEditingReward(reward);
        setFormData({
            name: reward.name,
            description: reward.description || '',
            pointsCost: reward.pointsCost,
            stock: reward.stock,
            category: reward.category || '',
            imageUrl: reward.imageUrl || '',
            isActive: reward.isActive
        });
        setShowModal(true);
    };

    const openCreate = () => {
        setEditingReward(null);
        setFormData(initialFormState);
        setShowModal(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Manage Rewards</h1>
                    <p className="text-muted-foreground">Create and edit rewards inventory</p>
                </div>
                <Button onClick={openCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Reward
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Inventory</CardTitle>
                    <CardDescription>
                        Manage your reward items. Points cost and stock levels.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[80px]">Image</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Cost</TableHead>
                                <TableHead>Stock</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rewards.map((reward) => (
                                <TableRow key={reward.id}>
                                    <TableCell>
                                        <div className="h-10 w-10 rounded-md bg-muted overflow-hidden flex items-center justify-center">
                                            {reward.imageUrl ? (
                                                <img src={reward.imageUrl} alt="" className="h-full w-full object-cover" />
                                            ) : (
                                                <ImageIcon className="h-5 w-5 text-muted-foreground" />
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium">{reward.name}</TableCell>
                                    <TableCell>{reward.pointsCost} pts</TableCell>
                                    <TableCell>
                                        {reward.stock === -1 ? (
                                            <Badge variant="outline">Unlimited</Badge>
                                        ) : (
                                            reward.stock
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {reward.category && <Badge variant="secondary">{reward.category}</Badge>}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => openEdit(reward)}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-destructive hover:text-destructive"
                                                onClick={() => handleDelete(reward.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="w-full max-w-2xl"
                        >
                            <Card className="max-h-[90vh] overflow-y-auto">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                                    <CardTitle>
                                        {editingReward ? 'Edit Reward' : 'New Reward'}
                                    </CardTitle>
                                    <Button variant="ghost" size="icon" onClick={() => setShowModal(false)}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </CardHeader>
                                <form onSubmit={handleSubmit}>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Name</Label>
                                                <Input
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Category</Label>
                                                <Input
                                                    value={formData.category}
                                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Points Cost</Label>
                                                <Input
                                                    type="number"
                                                    value={formData.pointsCost}
                                                    onChange={(e) => setFormData({ ...formData, pointsCost: e.target.value })}
                                                    required
                                                    min="1"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Stock (-1 for unlimited)</Label>
                                                <Input
                                                    type="number"
                                                    value={formData.stock}
                                                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Description</Label>
                                            <textarea
                                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Image URL</Label>
                                            <Input
                                                value={formData.imageUrl}
                                                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                                                placeholder="https://..."
                                            />
                                        </div>
                                    </CardContent>
                                    <div className="flex justify-end gap-3 p-6 pt-0">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setShowModal(false)}
                                        >
                                            Cancel
                                        </Button>
                                        <Button type="submit">
                                            {editingReward ? 'Update Reward' : 'Create Reward'}
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

export default AdminRewards;
