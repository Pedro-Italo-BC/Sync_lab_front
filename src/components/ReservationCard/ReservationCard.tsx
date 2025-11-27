'use client'

import { IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import ImageNotSupportedIcon from "@mui/icons-material/ImageNotSupported";
import { useRouter } from "next/navigation";

interface ReservationCardProps {
  reservation_id: string;
  resource_type: string;
  purpose: string;
  start_time: string;
  end_time: string;
  status: string;
  imageUrl?: string;
}

export function ReservationCard({
  reservation_id,
  resource_type,
  purpose,
  start_time,
  end_time,
  status,
  imageUrl,
}: ReservationCardProps) {
  const router = useRouter();

  function handleEdit() {
    router.push(`/reservations/edit/${reservation_id}`);
  }

  return (
    <div className="relative flex bg-[var(--foreground)] rounded-lg shadow-sm h-40">
      {/* Imagem lateral */}
      <div className="w-32 h-full flex items-center justify-center bg-gray-100">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Recurso reservado"
            className="object-cover w-full h-full"
          />
        ) : (
          <ImageNotSupportedIcon className="text-gray-500" fontSize="large" />
        )}
      </div>

      {/* Conteúdo do card */}
      <div className="flex-1 px-6 py-4 flex justify-between items-center">
        {/* Informações */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-black">{resource_type}</span>
            <span className={`text-sm font-medium ${status === "Confirmed" ? "text-green-600" : status === "Pending" ? "text-yellow-600" : "text-red-600"}`}>
              {status}
            </span>
          </div>
          <span className="text-sm text-gray-600"> {purpose}</span>
          <span className="text-sm text-gray-500">
             {new Date(start_time).toLocaleString()} → {new Date(end_time).toLocaleString()}
          </span>
        </div>

        {/* Botão de editar centralizado */}
        <IconButton
          onClick={handleEdit}
          className="text-[var(--blue-50)] hover:text-blue-700"
          aria-label="Editar agendamento"
        >
          <EditIcon fontSize="medium" />
        </IconButton>
      </div>
    </div>
  );
}