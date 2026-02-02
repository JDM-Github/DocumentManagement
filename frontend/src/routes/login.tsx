import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Mail, Eye, EyeOff, AlertCircle, GraduationCap, FileText, Users, TrendingUp } from 'lucide-react';
import { useAuth } from '../lib/context/auth';

export default function LoginScreen() {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async () => {
        if (!email || !password) {
            setError('Please enter both email and password');
            return;
        }
        setError('');
        setIsLoading(true);
        try {
            const result = await login(email, password);
            if (!result.success) {
                setError(result.error || 'Login failed. Please try again.');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.3,
            },
        },
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 },
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
            <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="hidden lg:block"
                >
                    <div className="space-y-6">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                            className="flex items-center gap-4"
                        >
                            <div className="w-24 h-24 rounded-2xl flex items-center justify-center shadow-2xl border-4 overflow-hidden">
                                <img
                                    src="/logo.png"
                                    alt="School Logo"
                                    className="w-full h-full object-contain p-2"
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                        const parent = e.currentTarget.parentElement;
                                        if (parent) {
                                            parent.innerHTML = '<div class="text-4xl">🎓</div>';
                                        }
                                    }}
                                />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900">City College of Calamba</h2>
                                <p className="text-slate-600">Excellence in Education</p>
                            </div>
                        </motion.div>

                        <div>
                            <h1 className="text-5xl font-bold text-slate-900 mb-4">
                                Document Tracking System
                            </h1>
                            <p className="text-xl text-slate-600 leading-relaxed mb-6">
                                Empowering students and faculty with seamless document management.
                                Your one-stop solution for tracking requests, submissions, and administrative workflows.
                            </p>
                        </div>

                        {/* Feature Cards */}
                        <div className="grid grid-cols-2 gap-4 pt-6">
                            {[
                                {
                                    icon: FileText,
                                    value: 'Fast',
                                    label: 'Request Processing',
                                    color: 'from-blue-500 to-blue-600'
                                },
                                {
                                    icon: Users,
                                    value: 'Easy',
                                    label: 'Collaboration',
                                    color: 'from-purple-500 to-purple-600'
                                },
                                {
                                    icon: TrendingUp,
                                    value: 'Smart',
                                    label: 'Document Tracking',
                                    color: 'from-indigo-500 to-indigo-600'
                                },
                                {
                                    icon: GraduationCap,
                                    value: '24/7',
                                    label: 'Accessibility',
                                    color: 'from-cyan-500 to-cyan-600'
                                },
                            ].map((feature, i) => {
                                const Icon = feature.icon;
                                return (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.5 + i * 0.1 }}
                                        className="bg-white p-5 rounded-xl shadow-lg border border-slate-200 hover:shadow-xl transition-shadow"
                                    >
                                        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center mb-3 shadow-md`}>
                                            <Icon className="w-6 h-6 text-white" />
                                        </div>
                                        <p className="text-xl font-bold text-slate-900">{feature.value}</p>
                                        <p className="text-sm text-slate-600">{feature.label}</p>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </motion.div>

                {/* Right Side - Login Form */}
                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="w-full"
                >
                    <motion.div
                        variants={item}
                        className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/50 p-8 lg:p-10"
                    >
                        {/* Mobile Logo */}
                        <div className="lg:hidden mb-6 flex flex-col items-center">
                            <div className="w-20 h-20 bg-white rounded-xl flex items-center justify-center shadow-lg border-2 border-blue-100 overflow-hidden mb-3">
                                <img
                                    src="/logo.png"
                                    alt="School Logo"
                                    className="w-full h-full object-contain p-2"
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                        const parent = e.currentTarget.parentElement;
                                        if (parent) {
                                            parent.innerHTML = '<div class="text-3xl">🎓</div>';
                                        }
                                    }}
                                />
                            </div>
                            <h2 className="text-lg font-bold text-slate-900">Your School Name</h2>
                        </div>

                        <motion.div variants={item} className="mb-8">
                            <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome Back!</h2>
                            <p className="text-slate-600">Sign in to access your dashboard</p>
                        </motion.div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3"
                            >
                                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                                <p className="text-sm text-red-800">{error}</p>
                            </motion.div>
                        )}

                        <div className="space-y-6">
                            <motion.div variants={item}>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Mail className="w-5 h-5 text-slate-400" />
                                    </div>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                                        className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none bg-white/50"
                                        placeholder="Enter your school email"
                                    />
                                </div>
                            </motion.div>

                            <motion.div variants={item}>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="w-5 h-5 text-slate-400" />
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                                        className="w-full pl-12 pr-12 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none bg-white/50"
                                        placeholder="Enter your password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="w-5 h-5" />
                                        ) : (
                                            <Eye className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                            </motion.div>

                            <motion.div variants={item} className="flex items-center justify-between">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                                    />
                                    <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">
                                        Remember me
                                    </span>
                                </label>
                                <button
                                    onClick={() => console.log('Forgot password clicked')}
                                    className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                                >
                                    Forgot Password?
                                </button>
                            </motion.div>

                            <motion.div variants={item}>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleSubmit}
                                    disabled={isLoading}
                                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                                            />
                                            Signing in...
                                        </span>
                                    ) : (
                                        'Sign In to Dashboard'
                                    )}
                                </motion.button>
                            </motion.div>
                        </div>

                        <motion.div variants={item} className="mt-8 pt-6 border-t border-slate-200">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <p className="text-xs text-slate-600 mb-2 font-semibold">Demo Credentials:</p>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div>
                                        <span className="text-slate-500">Email:</span>
                                        <p className="font-mono font-semibold text-slate-900">admin@dms.com</p>
                                    </div>
                                    <div>
                                        <span className="text-slate-500">Password:</span>
                                        <p className="font-mono font-semibold text-slate-900">admin123</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>

                    <motion.p
                        variants={item}
                        className="text-center text-sm text-slate-600 mt-6"
                    >
                        <GraduationCap className="w-4 h-4 inline mr-1" />
                        Developed for academic purposes • © 2026
                    </motion.p>
                </motion.div>
            </div>
        </div>
    );
}