import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import AuthLayout from '../components/layout/AuthLayout';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/Card';
import { AlertCircle } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
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
            // Enhanced error reporting for debugging
            const backendError = err.response?.data?.errors?.[0]?.msg || err.response?.data?.error;
            setError(backendError || 'Invalid credentials. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Welcome back"
            subtitle="Enter your email to sign in to your account"
        >
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Card className="border-0 shadow-none sm:border sm:shadow-sm">
                    <CardHeader className="space-y-1 px-0 sm:px-6">
                        {/* Title and subtitle handled by AuthLayout layout for consistency, or we can duplicate here for mobile if layout changes */}
                    </CardHeader>
                    <CardContent className="grid gap-4 px-0 sm:px-6">
                        {error && (
                            <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md flex items-center gap-2">
                                <AlertCircle className="h-4 w-4" />
                                {error}
                            </div>
                        )}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
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
                                    <Link to="/forgot-password" size="sm" className="text-xs text-primary hover:underline font-medium">
                                        Forgot password?
                                    </Link>
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={isLoading} isLoading={isLoading}>
                                Sign In
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-2 px-0 sm:px-6">
                        <div className="text-sm text-center text-muted-foreground">
                            Don't have an account?{' '}
                            <Link to="/signup" className="text-primary hover:underline font-medium">
                                Sign up
                            </Link>
                        </div>
                    </CardFooter>
                </Card>
            </motion.div>
        </AuthLayout>
    );
};

export default Login;
