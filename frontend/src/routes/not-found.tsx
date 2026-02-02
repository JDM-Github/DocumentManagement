import { motion } from 'framer-motion';
import { Home, ArrowLeft, FileQuestion, Search } from 'lucide-react';

interface NotFoundPageProps {
    onNavigateHome: () => void;
    onNavigateBack: () => void;
    onNavigateToPage?: (page: string) => void;
}

export default function NotFoundPage({ onNavigateHome, onNavigateBack, onNavigateToPage }: NotFoundPageProps) {
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2,
            },
        },
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 },
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center p-4">
            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="max-w-2xl w-full text-center"
            >
                <motion.div
                    variants={item}
                    className="mb-8 relative"
                >
                    <motion.div
                        animate={{
                            y: [0, -20, 0],
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                        className="inline-block"
                    >
                        <div className="relative">
                            <div className="text-9xl font-bold text-blue-600/20 select-none">
                                404
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <FileQuestion className="w-24 h-24 text-blue-600" />
                            </div>
                        </div>
                    </motion.div>
                </motion.div>

                <motion.div variants={item} className="mb-8">
                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
                        Page Not Found
                    </h1>
                    <p className="text-lg text-slate-600 mb-2">
                        Oops! The page you're looking for doesn't exist.
                    </p>
                    <p className="text-slate-500">
                        It might have been moved or deleted, or the URL might be incorrect.
                    </p>
                </motion.div>

                <motion.div
                    variants={item}
                    className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                >
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onNavigateHome}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                        <Home className="w-5 h-5" />
                        Go to Dashboard
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onNavigateBack}
                        className="flex items-center gap-2 px-6 py-3 bg-white text-slate-700 font-semibold rounded-lg shadow-md hover:shadow-lg border border-slate-200 transition-all duration-200"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Go Back
                    </motion.button>
                </motion.div>

                <motion.div
                    variants={item}
                    className="mt-12 p-6 bg-white/80 backdrop-blur-lg rounded-xl shadow-lg border border-white/50"
                >
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <Search className="w-5 h-5 text-slate-600" />
                        <h2 className="text-lg font-semibold text-slate-900">
                            Looking for something?
                        </h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                            { label: 'Dashboard', page: 'Dashboard' },
                            { label: 'Create Request', page: 'Create Request' },
                            { label: 'To Receive', page: 'To Receive' },
                            { label: 'Ongoing', page: 'Ongoing' },
                        ].map((link, i) => (
                            <button
                                key={i}
                                onClick={() => {
                                    if (link.page === 'Dashboard') {
                                        onNavigateHome();
                                    } else if (onNavigateToPage) {
                                        onNavigateToPage(link.page);
                                    }
                                }}
                                className="px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200 font-medium"
                            >
                                {link.label}
                            </button>
                        ))}
                    </div>
                </motion.div>

                <motion.div
                    variants={item}
                    className="mt-8 flex justify-center gap-2"
                >
                    {[0, 1, 2].map((i) => (
                        <motion.div
                            key={i}
                            animate={{
                                scale: [1, 1.2, 1],
                                opacity: [0.5, 1, 0.5],
                            }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                delay: i * 0.2,
                            }}
                            className="w-3 h-3 bg-blue-600 rounded-full"
                        />
                    ))}
                </motion.div>
            </motion.div>
        </div>
    );
}