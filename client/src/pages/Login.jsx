import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import AuthLayout from '../components/layout/AuthLayout';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Card, CardContent, CardFooter } from '../components/ui/Card';
import { AlertCircle, CheckCircle2, ShieldCheck, ArrowRight, Eye, EyeOff, RefreshCw } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Verification state for unverified accounts
    const [requiresVerification, setRequiresVerification] = useState(false);
    const [verificationEmail, setVerificationEmail] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const [verifying, setVerifying] = useState(false);
    const [resending, setResending] = useState(false);
    const [resendSuccess, setResendSuccess] = useState(false);

    const { login, verifyEmail, resendVerificationCode } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const userData = await login(email, password);
            if (userData.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            // Check if server indicated unverified account
            const resData = err.response?.data;
            if (resData?.requiresVerification) {
                setVerificationEmail(resData.email || email);
                setRequiresVerification(true);
                return;
            }

            const backendError = resData?.errors?.[0]?.msg || resData?.error;
            setError(backendError || 'Invalid email or password. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Handle 6-digit OTP verification
    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError('');
        setVerifying(true);

        try {
            await verifyEmail(verificationEmail, otpCode);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.errors?.[0]?.msg || 'Invalid or expired verification code. Please try again.');
        } finally {
            setVerifying(false);
        }
    };

    // Handle resend OTP
    const handleResendCode = async () => {
        setError('');
        setResending(true);
        setResendSuccess(false);

        try {
            await resendVerificationCode(verificationEmail);
            setResendSuccess(true);
            setTimeout(() => setResendSuccess(false), 6000);
        } catch (err) {
            setError(err.response?.data?.errors?.[0]?.msg || 'Failed to resend code. Please try again.');
        } finally {
            setResending(false);
        }
    };

    return (
        <AuthLayout
            title={requiresVerification ? "Verify Email" : "Welcome back"}
            subtitle={requiresVerification ? "Activate your Effission Loyalty account" : "Enter your email to sign in to your rewards"}
        >
            <AnimatePresence mode="wait">
                {requiresVerification ? (
                    // === OTP Verification Screen (Triggered if unverified user attempts sign-in) ===
                    <motion.div
                        key="login-otp-view"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-6"
                    >
                        <div className="p-4 bg-orange-50 border border-orange-200/80 rounded-2xl flex items-start gap-3">
                            <div className="p-2 bg-[#f36c14] text-white rounded-xl shrink-0 mt-0.5 shadow-sm">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                                <h3 className="text-sm font-bold text-slate-900">Email Verification Required</h3>
                                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                                    A fresh 6-digit verification code was sent to <span className="font-semibold text-slate-900 break-all">{verificationEmail}</span>.
                                </p>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-xl flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        {resendSuccess && (
                            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm p-3 rounded-xl flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                                <span>A fresh verification code has been dispatched to your email!</span>
                            </div>
                        )}

                        <form onSubmit={handleVerifyOtp} className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 text-center">
                                    Enter 6-Digit Code
                                </label>
                                <input
                                    type="text"
                                    required
                                    maxLength={6}
                                    value={otpCode}
                                    onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                                    placeholder="••••••"
                                    className="w-full bg-slate-50 border-2 border-slate-200 focus:border-[#f36c14] focus:bg-white rounded-2xl py-3.5 text-center text-3xl font-black tracking-[10px] font-mono text-slate-900 outline-none transition-all shadow-inner"
                                    autoFocus
                                />
                                <p className="text-[11px] text-slate-500 text-center mt-2 font-medium">
                                    Code is valid for 15 minutes
                                </p>
                            </div>

                            <Button
                                type="submit"
                                disabled={verifying || otpCode.length < 6}
                                isLoading={verifying}
                                className="w-full bg-[#f36c14] hover:bg-[#ea580c] text-white py-3 px-6 rounded-xl font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
                            >
                                Confirm & Sign In
                                <ArrowRight className="w-4 h-4 ml-1" />
                            </Button>
                        </form>

                        <div className="flex items-center justify-between text-xs pt-4 border-t border-slate-100 text-slate-500">
                            <button
                                type="button"
                                onClick={handleResendCode}
                                disabled={resending}
                                className="text-[#ea580c] hover:underline font-bold disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                            >
                                <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
                                {resending ? 'Sending...' : 'Resend Code'}
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setRequiresVerification(false);
                                    setError('');
                                }}
                                className="hover:text-slate-800 underline cursor-pointer"
                            >
                                Back to Sign In
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    // === Standard Sign In Screen ===
                    <motion.div
                        key="login-form-view"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Card className="border-0 shadow-none">
                            <CardContent className="grid gap-4 px-0">
                                {error && (
                                    <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-xl flex items-center gap-2">
                                        <AlertCircle className="h-4 w-4 shrink-0" />
                                        <span>{error}</span>
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-4 text-left">
                                    <div className="grid gap-2">
                                        <Label htmlFor="email">Email Address</Label>
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

                                    <div className="grid gap-2">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="password">Password</Label>
                                            <Link to="/forgot-password" className="text-xs text-[#f36c14] hover:underline font-semibold">
                                                Forgot password?
                                            </Link>
                                        </div>
                                        <div className="relative">
                                            <Input
                                                id="password"
                                                type={showPassword ? 'text' : 'password'}
                                                placeholder="••••••••"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                                disabled={isLoading}
                                                className="pr-10"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                                            >
                                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full bg-[#f36c14] hover:bg-[#ea580c] text-white py-3 rounded-xl font-bold shadow-md hover:shadow-lg transition-all"
                                        disabled={isLoading}
                                        isLoading={isLoading}
                                    >
                                        Sign In
                                    </Button>
                                </form>
                            </CardContent>

                            <CardFooter className="flex flex-col gap-2 px-0 pt-3">
                                <div className="text-sm text-center text-muted-foreground">
                                    Don't have an account?{' '}
                                    <Link to="/signup" className="text-[#f36c14] hover:underline font-semibold">
                                        Sign up
                                    </Link>
                                </div>
                            </CardFooter>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </AuthLayout>
    );
};

export default Login;
