import { RoomResource } from "@/ui/reserves/ReserveResource"

type RecommendationCardProps = {
    dataRoom: RoomResource
    handleReserve: () => void
}

export function RecommendationCard({dataRoom, handleReserve}: RecommendationCardProps) {

    return (
   <div className="w-80 shrink-0 bg-white rounded-lg shadow-md overflow-hidden border border-[#2B7FFF]/30">
    
    <img 
        src={dataRoom.imageUrl}
        alt="Imagem"
        className="w-full h-48 object-cover"
    />

    <div className="p-4 flex flex-col gap-3">

        <h3 className="text-lg font-semibold text-gray-800">
           Sala: {dataRoom.code}
        </h3>

        <p className="text-gray-600 text-sm">
          Capacidade: {dataRoom.capacity} 
        </p>

        <button
            className="w-full py-2 text-white font-medium rounded-md
            bg-[#2B7FFF] hover:bg-[#1f63cc] transition-all cursor-pointer"
            onClick={handleReserve}
        >
            Agendar
        </button>

    </div>

</div>
    )
}