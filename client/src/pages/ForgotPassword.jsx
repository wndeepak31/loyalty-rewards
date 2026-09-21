import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { motion } from 'framer-motion';
import AuthLayout from '../components/layout/AuthLayout';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Card, CardContent, CardFooter } from '../components/ui/Card';
import { AlertCircle, CheckCircle2, Mail, ArrowRight } from 'lucide-react';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setIsLoading(true);

        try {
            const res = await api.post('/auth/forgot-password', { email });
            setMessage(res.data.msg || 'If an account with that email exists, a password reset link has been sent.');
        } catch (err) {
            setError(err.response?.data?.errors?.[0]?.msg || 'Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Reset Password"
            subtitle="Enter your email to receive recovery instructions"
        >
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <Card className="border-0 shadow-none">
                    <CardContent className="grid gap-4 px-0">
                        {error && (
                            <div className="bg-destructive/15 text-destructive text-sm p-3.5 rounded-xl flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        {message ? (
                            <div className="p-4 bg-orange-50 border border-orange-200/80 rounded-2xl space-y-3">
                                <div className="flex items-center gap-3 text-[#ea580c]">
                                    <div className="p-2 bg-[#f36c14] text-white rounded-xl shrink-0">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <span className="font-bold text-sm text-slate-900">Check Your Inbox</span>
                                </div>
                                <p className="text-xs text-slate-600 leading-relaxed">
                                    {message}
                                </p>
                                <p className="text-[11px] text-slate-500">
                                    The reset link is valid for 1 hour. Be sure to check your spam folder if you don't see it.
                                </p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4 text-left">
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Registered Email Address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="name@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full bg-[#f36c14] hover:bg-[#ea580c] text-white py-3 rounded-xl font-bold shadow-md hover:shadow-lg transition-all"
                                    disabled={isLoading}
                                    isLoading={isLoading}
                                >
                                    Send Reset Link
                                    <ArrowRight className="w-4 h-4 ml-1" />
                                </Button>
                            </form>
                        )}
                    </CardContent>

                    <CardFooter className="flex flex-col gap-2 px-0 pt-3">
                        <div className="text-sm text-center text-muted-foreground">
                            Remember your password?{' '}
                            <Link to="/login" className="text-[#f36c14] hover:underline font-semibold">
                                Back to sign in
                            </Link>
                        </div>
                    </CardFooter>
                </Card>
            </motion.div>
        </AuthLayout>
    );
};

export default ForgotPassword;
