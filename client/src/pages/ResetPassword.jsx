import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { motion } from 'framer-motion';
import AuthLayout from '../components/layout/AuthLayout';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/Card';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (password !== confirmPassword) {
            return setError('Passwords do not match');
        }

        setIsLoading(true);
        try {
            const res = await api.post(`/auth/reset-password/${token}`, { password });
            setMessage(res.data.msg);
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.errors?.[0]?.msg || 'Something went wrong. Link may be expired.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Reset your password"
            subtitle="Please enter your new password below."
        >
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Card className="border-0 shadow-none sm:border sm:shadow-sm">
                    <CardHeader className="space-y-1 px-0 sm:px-6">
                    </CardHeader>
                    <CardContent className="grid gap-4 px-0 sm:px-6">
                        {error && (
                            <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md flex items-center gap-2">
                                <AlertCircle className="h-4 w-4" />
                                {error}
                            </div>
                        )}
                        {message && (
                            <div className="bg-emerald-500/15 text-emerald-600 text-sm p-3 rounded-md flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4" />
                                {message}
                            </div>
                        )}

                        {!message && (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="password">New Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        disabled={isLoading}
                                        minLength={6}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                                <Button type="submit" className="w-full" disabled={isLoading} isLoading={isLoading}>
                                    Update Password
                                </Button>
                            </form>
                        )}
                    </CardContent>
                    <CardFooter className="flex flex-col gap-2 px-0 sm:px-6">
                        <div className="text-sm text-center text-muted-foreground">
                            Back to{' '}
                            <Link to="/login" className="text-primary hover:underline font-medium">
                                login
                            </Link>
                        </div>
                    </CardFooter>
                </Card>
            </motion.div>
        </AuthLayout>
    );
};

export default ResetPassword;
