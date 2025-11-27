'use client'

import { IconButton, Button, Box } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import ImageNotSupportedIcon from "@mui/icons-material/ImageNotSupported";
import { Reservation } from "@/app/(mainpg)/admin/manage-reservations/page";

type ReservationApprovalCardProps = {
  reservation: Reservation;
  onViewDetails: () => void;
  onApprove: () => void;
  onReject: () => void;
}  ;

export function ReservationApprovalCard({
  reservation,
  onViewDetails,
  onApprove,
  onReject,
}: ReservationApprovalCardProps) {
  const imageLoaded = !!reservation.imageUrl;

  return (
    <Box className="relative overflow-visible">
      {/* Card principal */}
      <Box
        sx={{
          display: "flex",
          height: 230,
          backgroundColor: "var(--foreground)",
          borderRadius: 2,
          boxShadow: 1,
          overflow: "visible",
          position: "relative",
        }}
      >
        {/* Imagem lateral */}
        <Box
          sx={{
            width: 160,
            height: "100%",
            backgroundColor: "#f3f3f3",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {imageLoaded ? (
            <img
              src={reservation.imageUrl}
              alt="Recurso"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <ImageNotSupportedIcon sx={{ fontSize: 40, color: "#9ca3af" }} />
          )}
        </Box>

        {/* Conteúdo */}
        <Box
          sx={{
            flex: 1,
            px: 3,
            py: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box gap={1} display={"flex"} flexDirection={"column"}>
            <Box display="flex" alignItems="center" gap={1}>
              <span className="text-lg font-bold text-black">{reservation.resource_type}</span>
              <span className="text-sm font-medium text-yellow-600">{reservation.status}</span>
            </Box>
            <div className="flex gap-2"><p className="text-sm text-gray-800 font-bold">Recurso: </p> <span  className="text-sm text-gray-600">{reservation.resource_details.name}</span></div>
            <div className="flex gap-2"><p className="text-sm text-gray-800 font-bold">Proposta: </p> <span  className="text-sm text-gray-600">{reservation.purpose}</span></div>
            <div className="flex gap-2"><p className="text-sm text-gray-800 font-bold">Nome: </p> <span  className="text-sm text-gray-600">{reservation.user.name}</span></div>
                     <div className="flex gap-2"><p className="text-sm text-gray-800 font-bold">Papel: </p> <span  className="text-sm text-gray-600">{reservation.user.role}</span></div>     
            <span className="text-sm text-gray-500">
               {new Date(reservation.start_time).toLocaleString()} →{" "}
              {new Date(reservation.end_time).toLocaleString()}
            </span>
          </Box>

          {/* Botões */}
          <Box display="flex" alignItems="center" gap={1}>
            <button
              onClick={onViewDetails}
              className="bg-[var(--blue-50)] text-white transform-none rounded-lg px-2 h-12 flex justify-center items-center min-w-0  hover:brightness-90 duration-300 transition cursor-pointer gap-2"
            >
              <InfoOutlinedIcon />
              <span className="font-medium">Detalhes</span>
            </button>

            <IconButton
              onClick={onApprove}
              sx={{
                backgroundColor: "#6ee7b7",
                color: "#fff",
                borderRadius: 2,
                width: 48,
                height: 48,
              }}
            >
              <CheckIcon />
            </IconButton>

            <IconButton
              onClick={onReject}
              sx={{
                backgroundColor: "#ef4444",
                color: "#fff",
                borderRadius: 2,
                width: 48,
                height: 48,
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}