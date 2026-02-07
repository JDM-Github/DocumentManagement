import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageSquare,
    X,
    Send,
    Trash2,
    Sparkles,
    Loader2
} from 'lucide-react';
import RequestHandler from '../lib/utilities/RequestHandler';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
    dataFetched?: {
        route: string;
        data: any;
    } | null;
    isError?: boolean;
}

const AIChat = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!inputMessage.trim() || loading) return;

        const userMessage: Message = {
            role: 'user',
            content: inputMessage,
            timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setLoading(true);

        try {
            const conversationHistory = messages.map(msg => ({
                role: msg.role,
                content: msg.content
            }));

            const response = await RequestHandler.fetchData(
                'POST',
                'ai/chat',
                {
                    message: inputMessage,
                    conversationHistory: conversationHistory
                }
            );

            if (response.success) {
                const aiMessage: Message = {
                    role: 'assistant',
                    content: response.response,
                    timestamp: new Date().toISOString(),
                    dataFetched: response.dataFetched || null
                };

                setMessages(prev => [...prev, aiMessage]);
            } else {
                throw new Error(response.message || 'Failed to get response');
            }
        } catch (error: any) {
            console.error('Error sending message:', error);

            const errorMessage: Message = {
                role: 'assistant',
                content: error.message || 'Sorry, I encountered an error. Please try again.',
                timestamp: new Date().toISOString(),
                isError: true
            };

            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    const clearChat = () => {
        if (messages.length > 0 && confirm('Clear all messages?')) {
            setMessages([]);
        }
    };

    const suggestedQuestions = [
        "How many accomplishments do I have?",
        "Show me my pass slip records",
        "What's the status of my requests?",
        "Do I have any pending notifications?",
    ];

    const askSuggested = (question: string) => {
        setInputMessage(question);
    };

    return (
        <AnimatePresence>
            <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full shadow-lg flex items-center justify-center text-white hover:shadow-xl transition-all duration-200"
            >
                {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
                {!isOpen && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"
                    />
                )}
            </motion.button>

            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    className="fixed bottom-24 right-6 z-50 w-96 h-[600px] bg-white rounded-xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden"
                >
                    <div className="bg-gradient-to-r from-[#0B1C3A] to-[#1E40AF] px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm border border-white/20">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="text-white font-semibold text-sm">AI Assistant</h3>
                                <p className="text-white/70 text-xs">Ask me anything</p>
                            </div>
                        </div>
                        <button
                            onClick={clearChat}
                            disabled={messages.length === 0}
                            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Trash2 className="w-4 h-4 text-white" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-br from-slate-50 to-slate-100">
                        {messages.length === 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-center space-y-4 py-8"
                            >
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto">
                                    <Sparkles className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h4 className="text-slate-900 font-semibold mb-1">👋 Hello! How can I help?</h4>
                                    <p className="text-sm text-slate-600">Ask me about your documents and system data</p>
                                </div>

                                <div className="space-y-2 pt-4">
                                    <p className="text-xs font-semibold text-slate-700">Try asking:</p>
                                    {suggestedQuestions.map((question, index) => (
                                        <motion.button
                                            key={index}
                                            whileHover={{ scale: 1.02, x: 4 }}
                                            onClick={() => askSuggested(question)}
                                            className="w-full text-left px-4 py-2.5 bg-white rounded-lg shadow-sm border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all text-sm text-slate-700"
                                        >
                                            {question}
                                        </motion.button>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {messages.map((msg, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`max-w-[85%] ${msg.role === 'user' ? 'order-2' : 'order-1'}`}>
                                    <div
                                        className={`rounded-xl px-4 py-2.5 ${msg.role === 'user'
                                                ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
                                                : msg.isError
                                                    ? 'bg-red-50 text-red-900 border border-red-200'
                                                    : 'bg-white text-slate-900 shadow-sm border border-slate-200'
                                            }`}
                                    >
                                        <p className="text-sm leading-relaxed">{msg.content}</p>
                                    </div>
                                    <div className={`flex items-center gap-2 mt-1 px-1 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <span className="text-xs text-slate-500">
                                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        {msg.dataFetched && (
                                            <span className="text-xs text-blue-600 flex items-center gap-1">
                                                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                                                Data fetched
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}

                        {loading && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex justify-start"
                            >
                                <div className="bg-white rounded-xl px-4 py-3 shadow-sm border border-slate-200">
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                                        <span className="text-sm text-slate-600">Thinking...</span>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    <form onSubmit={sendMessage} className="p-4 bg-white border-t border-slate-200">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                placeholder="Ask me anything..."
                                disabled={loading}
                                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            />
                            <button
                                type="submit"
                                disabled={loading || !inputMessage.trim()}
                                className="px-4 py-2.5 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </form>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default AIChat;