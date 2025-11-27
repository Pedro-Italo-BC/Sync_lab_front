"use client";

import { useEffect, useState } from "react";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { api_url } from "@/utils/fetch-url";

type Notification = {
  id: string;
  title: string;
  message: string;
  sentAt: string;
  read?: boolean;
};

export default function Notifications() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch(`${api_url}/api/notification/visible`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (!res.ok) throw new Error("Erro ao buscar notificações");

        const data: Notification[] = await res.json();
        setNotifications(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-2.5 rounded-full bg-[var(--background)] cursor-pointer hover:brightness-90 duration-300 transition relative"
      >
        <NotificationsIcon fontSize="medium" />
        {notifications.length > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full"></span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-lg p-4 z-50 border border-gray-200">
          <h3 className="font-bold mb-3 text-gray-800">Notificações</h3>

          {loading ? (
            <p className="text-gray-500 text-sm">Carregando...</p>
          ) : notifications.length === 0 ? (
            <p className="text-gray-500 text-sm">Sem notificações</p>
          ) : (
            <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className="p-3 rounded-md shadow-sm hover:shadow-md transition bg-blue-50 border border-blue-100"
                >
                  <p className="font-semibold text-gray-800">{n.title}</p>
                  <p className="text-gray-600 text-sm">{n.message}</p>
                  <p className="text-gray-400 text-xs mt-1">
                    {new Date(n.sentAt).toLocaleString("pt-BR")}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
