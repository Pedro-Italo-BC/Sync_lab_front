import { PencilSimple } from "phosphor-react";

type DisplayReservation = {
    reservation_id: string;
    resource_type: string;
    purpose: string;
    start_time: string;
    end_time: string;
    status: string;
}

type ReservationItemProps = {
    res: DisplayReservation;
    onEdit: (res: DisplayReservation) => void;
}

export function ReservationItem({onEdit, res}: ReservationItemProps) {
      const statusColor =
        res.status === "Confirmado" ? "text-green-600" :
            res.status === "Pendente" ? "text-yellow-600" :
                "text-red-600";

    const startTime = new Date(res.start_time).toLocaleString();
    const endTime = new Date(res.end_time).toLocaleTimeString();

    return (
        <div
            key={res.reservation_id}
            className="bg-white p-6 rounded-lg shadow flex justify-between items-center"
        >
            <div>
                <h3 className="font-bold text-lg">{res.purpose}</h3>
                <p className="text-sm text-gray-600">
                    {res.resource_type} - {startTime} → {endTime}
                </p>
                <p className={`mt-1 font-semibold ${statusColor}`}>{res.status}</p>
            </div>

            <button
                onClick={() => onEdit(res)}
                className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition cursor-pointer"
                title="Detalhes / Editar"
            >
                <PencilSimple size={20} weight="bold" />
            </button>
        </div>
    );
}