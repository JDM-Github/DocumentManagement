import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import {
    Download,
    Copy,
    Share2,
    Calendar,
    Users,
    Star,
    ExternalLink,
    CheckCircle,
    BookOpen
} from "lucide-react";
import RequestHandler from "../../lib/utilities/RequestHandler";
import { showToast, removeToast } from "../../components/toast";

export default function MyEvaluationQRCode() {
    const [uniqueCode, setUniqueCode] = useState<string>("");
    const [academicPeriod, setAcademicPeriod] = useState<string>("");
    const [evaluationUrl, setEvaluationUrl] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        fetchMyEvaluationCode();
    }, []);

    const fetchMyEvaluationCode = async () => {
        setLoading(true);
        const toastId = showToast("Loading your evaluation code...", "loading");

        try {
            const res = await RequestHandler.fetchData("GET", "student-evaluation/get-my-code", {});
            removeToast(toastId);

            if (res.success) {
                setUniqueCode(res.uniqueCode);
                setAcademicPeriod(res.academicPeriod);

                const baseUrl = window.location.origin;
                const url = `${baseUrl}/evaluate/${res.uniqueCode}`;
                setEvaluationUrl(url);
            } else {
                showToast(res.message || "Failed to load evaluation code.", "error");
            }
        } catch (err) {
            removeToast(toastId);
            showToast("Unexpected error occurred.", "error");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(evaluationUrl);
            setCopied(true);
            showToast("Link copied to clipboard!", "success");
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            showToast("Failed to copy link", "error");
        }
    };

    const downloadQRCode = () => {
        const svg = document.getElementById("qr-code");
        if (!svg) return;

        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new Image();

        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx?.drawImage(img, 0, 0);

            const pngFile = canvas.toDataURL("image/png");
            const downloadLink = document.createElement("a");
            downloadLink.download = `evaluation-qr-${uniqueCode}.png`;
            downloadLink.href = pngFile;
            downloadLink.click();

            showToast("QR code downloaded!", "success");
        };

        img.src = "data:image/svg+xml;base64," + btoa(svgData);
    };

    const shareLink = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: "Evaluate My Teaching",
                    text: `Please evaluate my teaching for ${academicPeriod}`,
                    url: evaluationUrl,
                });
            } catch (err) {
                console.log("Share cancelled or failed");
            }
        } else {
            copyToClipboard();
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-slate-600">Loading your evaluation QR code...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 p-4 sm:p-6 lg:p-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-7xl mx-auto"
            >
                <div className="mb-6">
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
                        Student Evaluation QR Code
                    </h1>
                    <p className="text-base text-slate-600">
                        Share this QR code with your students for anonymous feedback
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4 }}
                        className="bg-white p-6 rounded-xl shadow-md border border-slate-200"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <BookOpen size={24} className="text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-600">Academic Period</p>
                                <p className="text-xl font-bold text-slate-900">{academicPeriod}</p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4 }}
                        className="bg-white p-6 rounded-xl shadow-md border border-slate-200"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-3 bg-green-100 rounded-lg">
                                <Star size={24} className="text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-600">Evaluation Code</p>
                                <p className="text-xl font-bold text-slate-900 font-mono">{uniqueCode}</p>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Main QR Code Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="bg-white rounded-2xl shadow-xl border-2 border-slate-200 overflow-hidden"
                >
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
                        <div className="flex items-center gap-3">
                            <Users size={28} />
                            <div>
                                <h2 className="text-2xl font-bold">Student Evaluation</h2>
                                <p className="text-blue-100">Scan to provide feedback</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-8">
                        {/* QR Code */}
                        <div className="flex justify-center mb-6">
                            <div className="bg-white p-6 rounded-2xl shadow-lg border-4 border-slate-200">
                                <QRCodeSVG
                                    id="qr-code"
                                    value={evaluationUrl}
                                    size={280}
                                    level="H"
                                    includeMargin={true}
                                />
                            </div>
                        </div>

                        {/* URL Display */}
                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Evaluation Link
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={evaluationUrl}
                                    readOnly
                                    className="flex-1 px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg text-slate-700 font-mono text-sm"
                                />
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={copyToClipboard}
                                    className={`px-4 py-3 rounded-lg font-medium transition-all ${copied
                                            ? "bg-green-600 text-white"
                                            : "bg-blue-600 text-white hover:bg-blue-700"
                                        }`}
                                >
                                    {copied ? <CheckCircle size={20} /> : <Copy size={20} />}
                                </motion.button>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={downloadQRCode}
                                className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all"
                            >
                                <Download size={20} />
                                Download QR
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={shareLink}
                                className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all"
                            >
                                <Share2 size={20} />
                                Share Link
                            </motion.button>

                            <motion.a
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                href={evaluationUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all"
                            >
                                <ExternalLink size={20} />
                                Preview
                            </motion.a>
                        </div>
                    </div>
                </motion.div>

                {/* Instructions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="mt-6 p-6 bg-blue-50 border border-blue-200 rounded-xl"
                >
                    <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                        <Calendar size={20} />
                        How to Use
                    </h3>
                    <ul className="space-y-2 text-sm text-blue-800">
                        <li className="flex items-start gap-2">
                            <span className="font-bold">1.</span>
                            <span>Download or share the QR code with your students</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="font-bold">2.</span>
                            <span>Students scan the QR code using their phone camera</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="font-bold">3.</span>
                            <span>They'll be directed to provide anonymous feedback</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="font-bold">4.</span>
                            <span>Each student can only submit one evaluation per academic period</span>
                        </li>
                    </ul>
                </motion.div>
            </motion.div>
        </div>
    );
}