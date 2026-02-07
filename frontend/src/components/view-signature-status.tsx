import { motion } from "framer-motion";
import { CheckCircle, UserCheck } from "lucide-react";


export function ViewSignatureStatus({
    isHaveDeanSignature,
    isHavePresidentSignature
}: {
    isHaveDeanSignature: boolean;
        isHavePresidentSignature: boolean;
}) {
    return <>
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden"
        >
            <div className="bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200 px-6 py-4">
                <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <UserCheck size={18} className="text-blue-600" />
                    Approval Status
                </h2>
            </div>

            <div className="p-6 space-y-4">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.5 }}
                    className={`relative overflow-hidden rounded-xl border-2 transition-all ${isHaveDeanSignature
                        ? "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-sm"
                        : "bg-white border-slate-200"
                        }`}
                >
                    {isHaveDeanSignature && (
                        <div className="absolute top-4 right-4">
                            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-green-600 text-white">
                                <CheckCircle size={12} />
                                Signed
                            </span>
                        </div>
                    )}

                    <div className="p-5">
                        <div className="flex items-center gap-3">
                            <div
                                className={`p-2 rounded-lg ${isHaveDeanSignature
                                    ? "bg-green-100"
                                    : "bg-amber-100"
                                    }`}
                            >
                                <UserCheck
                                    size={20}
                                    className={
                                        isHaveDeanSignature
                                            ? "text-green-600"
                                            : "text-amber-600"
                                    }
                                />
                            </div>
                            <div>
                                <p className="text-base font-bold text-slate-800">Dean Signature</p>
                                <p
                                    className={`text-sm font-medium ${isHaveDeanSignature
                                        ? "text-green-700"
                                        : "text-amber-700"
                                        }`}
                                >
                                    {isHaveDeanSignature
                                        ? "Approved and Signed"
                                        : "Awaiting Signature"}
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.6 }}
                    className={`relative overflow-hidden rounded-xl border-2 transition-all ${isHavePresidentSignature
                        ? "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-sm"
                        : "bg-white border-slate-200"
                        }`}
                >
                    {isHavePresidentSignature && (
                        <div className="absolute top-4 right-4">
                            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-green-600 text-white">
                                <CheckCircle size={12} />
                                Signed
                            </span>
                        </div>
                    )}

                    <div className="p-5">
                        <div className="flex items-center gap-3">
                            <div
                                className={`p-2 rounded-lg ${isHavePresidentSignature
                                    ? "bg-green-100"
                                    : "bg-amber-100"
                                    }`}
                            >
                                <UserCheck
                                    size={20}
                                    className={
                                        isHavePresidentSignature
                                            ? "text-green-600"
                                            : "text-amber-600"
                                    }
                                />
                            </div>
                            <div>
                                <p className="text-base font-bold text-slate-800">
                                    President Signature
                                </p>
                                <p
                                    className={`text-sm font-medium ${isHavePresidentSignature
                                        ? "text-green-700"
                                        : "text-amber-700"
                                        }`}
                                >
                                    {isHavePresidentSignature
                                        ? "Approved and Signed"
                                        : "Awaiting Signature"}
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    </>
}