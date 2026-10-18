import React from "react";
import { useWeb3 } from "../context/Web3Context";
import { CheckCircle2, AlertCircle, Info } from "lucide-react";

export default function Toasts() {
  const { toasts } = useWeb3();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((t) => {
        let Icon = CheckCircle2;
        let iconColor = "var(--accent-emerald)";
        if (t.type === "error") {
          Icon = AlertCircle;
          iconColor = "var(--accent-rose)";
        } else if (t.type === "info") {
          Icon = Info;
          iconColor = "var(--accent-cyan)";
        }

        return (
          <div key={t.id} className={`toast ${t.type || "success"}`}>
            <Icon size={20} color={iconColor} style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: "0.9rem" }}>{t.title}</div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "2px" }}>
                {t.message}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
