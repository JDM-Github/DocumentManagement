import { toast, ToastOptions, Id, cssTransition } from "react-toastify";
import { CheckCircle, XCircle, Info, LoaderCircle, HelpCircle } from "lucide-react";
import "react-toastify/dist/ReactToastify.css";

const themeColors = {
    primary: "#F3F7FF",
    sidebarFrom: "#10213f",
    sidebarTo: "#E4EDFF",
    accentBlue: "#1B3769",
    accentCyan: "#142C57",
    white: "#FFFFFF",
    lightText: "#EDEDED",
    darkText: "#0d2758"
};

const baseStyle = {
    background: `linear-gradient(135deg, ${themeColors.white}, ${themeColors.sidebarTo})`,
    color: themeColors.darkText,
    border: `1px solid rgba(0,0,0,0.1)`,
    borderRadius: "12px",
    padding: "16px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
    backdropFilter: "blur(10px)",
};

// Overlay management
const createOverlay = (id: string) => {
    const overlayId = `toast-overlay-${id}`;
    if (document.getElementById(overlayId)) return;

    const overlay = document.createElement('div');
    overlay.id = overlayId;
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.3);
        backdrop-filter: blur(2px);
        z-index: 9998;
        animation: fadeIn 0.2s ease-out;
    `;
    document.body.appendChild(overlay);
};

const removeOverlay = (id: string) => {
    const overlayId = `toast-overlay-${id}`;
    const overlay = document.getElementById(overlayId);
    if (overlay) {
        overlay.style.animation = 'fadeOut 0.2s ease-in';
        setTimeout(() => overlay.remove(), 200);
    }
};

const addStyles = () => {
    const styleId = 'toast-custom-animations';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.innerHTML = `
    @keyframes iconPulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes fadeOut {
      from { opacity: 1; }
      to { opacity: 0; }
    }
    .toast-pulse { animation: pulseGlow 2s ease-in-out infinite; }
    .toast-icon-pulse { animation: iconPulse 1.5s ease-in-out infinite; }
    .toast-with-overlay { z-index: 9999 !important; }
  `;
    document.head.appendChild(style);
};
addStyles();

const slideRight = cssTransition({
    enter: "slideInRight",
    exit: "slideOutRight",
});

const addSlideKeyframes = () => {
    const styleId = 'toast-slide-keyframes';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.innerHTML = `
    @keyframes slideInRight {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }

    @keyframes slideOutRight {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(100%); opacity: 0; }
    }

    .slideInRight { animation: slideInRight 0.3s ease-out both; }
    .slideOutRight { animation: slideOutRight 0.3s ease-in both; }
  `;
    document.head.appendChild(style);
};
addSlideKeyframes();

export const showToast = (
    message: string,
    type: "success" | "error" | "info" | "loading" = "success",
    timeout: number = 2000
): Id => {
    const icons = {
        success: <CheckCircle size={24} />,
        error: <XCircle size={24} />,
        loading: <LoaderCircle size={24} className="animate-spin" />,
        info: <Info size={24} />
    };

    const colors = {
        success: { borderLeft: "4px solid #4CAF50", iconClass: "text-green-600", pulseClass: "border-green-100" },
        error: { borderLeft: "4px solid #F44336", iconClass: "text-red-600", pulseClass: "border-red-100" },
        info: { borderLeft: "4px solid #2196F3", iconClass: "text-blue-600", pulseClass: "border-blue-100" },
        loading: { borderLeft: "4px solid #FFB300", iconClass: "text-yellow-600", pulseClass: "border-yellow-100" }
    };

    const toastOptions: ToastOptions = {
        position: "top-right",
        autoClose: type === "loading" ? false : timeout,
        hideProgressBar: false,
        closeOnClick: type !== "loading",
        closeButton: type !== "loading",
        pauseOnHover: true,
        draggable: type !== "loading",
        draggablePercent: 60,
        theme: "light",
        transition: slideRight,
        className: `toast-pulse ${colors[type].pulseClass} ${type === "loading" ? "toast-with-overlay" : ""}`,
        style: {
            ...baseStyle,
            borderLeft: colors[type].borderLeft,
            background: type === "success"
                ? `linear-gradient(135deg, ${themeColors.white}, #E8F5E9)`
                : type === "error"
                    ? `linear-gradient(135deg, ${themeColors.white}, #FFEBEE)`
                    : type === "info"
                        ? `linear-gradient(135deg, ${themeColors.white}, #E3F2FD)`
                        : `linear-gradient(135deg, ${themeColors.white}, #FFF3E0)`,
        },
    };

    let toastId: Id;

    toastId = toast(
        <div className="flex items-start gap-3">
            <div className={`flex-shrink-0 toast-icon-pulse ${colors[type].iconClass}`}>{icons[type]}</div>
            <div className="flex-1">
                <div className="font-medium mb-1">
                    {type === "success" && "Success!"}
                    {type === "error" && "Error!"}
                    {type === "info" && "Information"}
                    {type === "loading" && "Loading..."}
                </div>
                <div className="text-sm opacity-90">{message}</div>
            </div>
        </div>,
        {
            ...toastOptions,
            onOpen: () => {
                if (type === "loading") {
                    setTimeout(() => createOverlay(String(toastId)), 0);
                }
            },
            onClose: () => {
                if (type === "loading") {
                    removeOverlay(String(toastId));
                }
            }
        }
    );

    return toastId;
};

export const removeToast = (id: Id) => {
    removeOverlay(String(id));
    toast.dismiss(id);
};

export const confirmToast = (
    message: string,
    onConfirm: () => void,
    onCancel?: () => void
): Id => {
    let confirmed = false;
    let toastId: Id;

    toastId = toast(
        <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3">
                <div className="flex-shrink-0 toast-icon-pulse text-yellow-600">
                    <HelpCircle size={24} />
                </div>
                <div className="flex-1">
                    <div className="font-medium mb-1">Confirmation Required</div>
                    <div className="text-sm opacity-90">{message}</div>
                </div>
            </div>
            <div className="flex justify-end gap-3 pt-2 border-t border-gray-200">
                <button
                    onClick={() => {
                        removeOverlay(String(toastId));
                        toast.dismiss(toastId);
                    }}
                    className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-100 transition-all duration-200"
                >
                    Cancel
                </button>
                <button
                    onClick={() => {
                        confirmed = true;
                        removeOverlay(String(toastId));
                        toast.dismiss(toastId);
                        onConfirm();
                    }}
                    className="px-4 py-2 text-sm rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 transition-all duration-200"
                >
                    Confirm
                </button>
            </div>
        </div>,
        {
            position: "top-right",
            autoClose: false,
            closeOnClick: false,
            draggable: false,
            hideProgressBar: true,
            theme: "light",
            onOpen: () => setTimeout(() => createOverlay(String(toastId)), 0),
            onClose: () => {
                removeOverlay(String(toastId));
                if (!confirmed) onCancel?.();
            },
            transition: slideRight,
            style: { ...baseStyle, borderLeft: "4px solid #FFB300", background: "#FFFDE7" },
            className: "toast-pulse border-yellow-100 toast-with-overlay",
        }
    );

    return toastId;
};