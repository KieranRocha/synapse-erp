import React, { useEffect } from "react";
import { CheckCircle2 } from "lucide-react";
import { useToastStore } from "../../stores/toastStore";

export default function ToastViewport() {
    const { toasts, remove } = useToastStore();
    useEffect(() => {
        const timers = toasts.map((t: any) => setTimeout(() => remove(t.id), 2200));
        return () => timers.forEach(clearTimeout);
    }, [toasts, remove]);
    if (toasts.length === 0) return null;
    return (
        <div className="fixed bottom-4 right-4 space-y-2 z-50">
            {toasts.map((t: any) => (
                <div
                    key={t.id}
                    className="flex items-center gap-2 rounded-xl border border-neutral-700/40 bg-neutral-900/90 text-neutral-50 px-3 py-2 shadow-lg backdrop-blur"
                >
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                    <span className="text-sm">{t.message}</span>
                </div>
            ))}
        </div>
    );
}
