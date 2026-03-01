import { useEffect } from "react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import { useAppContext } from "@/contexts/AppContext";

/**
 * Global Notification Center
 */
export default function NotificationCenter() {
  const { message, setMessage } = useAppContext();

  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(() => {
      setMessage(null);
    }, 5000);

    return () => clearTimeout(timer);
  }, [message, setMessage]);

  if (!message) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-green-400" />,
    error: <AlertCircle className="w-5 h-5 text-red-400" />,
    info: <Info className="w-5 h-5 text-blue-400" />,
  };

  const bgColors = {
    success: "bg-green-500/10 border-green-500/30",
    error: "bg-red-500/10 border-red-500/30",
    info: "bg-blue-500/10 border-blue-500/30",
  };

  const textColors = {
    success: "text-green-300",
    error: "text-red-300",
    info: "text-blue-300",
  };

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      <div
        className={`flex items-center gap-3 p-4 rounded-lg border ${bgColors[message.type]} backdrop-blur-sm`}
      >
        {icons[message.type]}
        <p className={`flex-1 text-sm font-medium ${textColors[message.type]}`}>
          {message.text}
        </p>
        <button
          onClick={() => setMessage(null)}
          className="text-slate-400 hover:text-slate-300"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
