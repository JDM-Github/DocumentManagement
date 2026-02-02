import { Mail} from "lucide-react";
export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gradient-to-r from-[#0B1C3A] to-[#1E40AF] border-t border-white/10">
            <div className="px-4 sm:px-6 md:px-8 py-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                    <div className="space-y-1">
                        <h3 className="text-sm font-semibold text-white">
                            Document Management System
                        </h3>
                        <p className="text-xs text-white/60">
                            © {currentYear} All rights reserved
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <a
                            href="mailto:support@dms.com"
                            className="flex items-center gap-2 text-xs text-white/70 hover:text-white transition"
                        >
                            <Mail className="w-4 h-4" />
                            support@dms.com
                        </a>

                    </div>
                </div>
            </div>
        </footer>
    );
}
