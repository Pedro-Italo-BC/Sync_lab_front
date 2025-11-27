type ResourceItemStatus = "Disponível" | "Indisponível";

type ResourceItem = {
    id: string;
    name: string;
    description: string;
    status: ResourceItemStatus;
    imageUrl: string;
};

type ResourceCardProps = {
    item: ResourceItem,
    onReserve: (item: ResourceItem) => void
}

export function ResourceCard({ item, onReserve }: ResourceCardProps){
    const isAvailable = item.status === "Disponível";
    const statusColor = isAvailable ? "text-green-600" : "text-red-600";
    const buttonClass = isAvailable
        ? "bg-blue-500 hover:bg-blue-600"
        : "bg-gray-400 cursor-not-allowed";

    return (
        <div key={item.id} className="bg-white rounded-lg p-4 shadow flex flex-col justify-between">
            <img src={item.imageUrl || '/placeholder.png'} alt={item.name} className="w-full h-40 object-contain mb-4" />
            <h3 className="font-bold text-lg">{item.name}</h3>
            <p className="text-gray-700 mt-2 flex-grow">{item.description}</p>
            <p className={`mt-2 font-semibold ${statusColor}`}>{item.status}</p>
            <button
                onClick={() => onReserve(item)}
                disabled={!isAvailable}
                className={`mt-4 px-4 py-2 rounded-lg text-white transition cursor-pointer ${buttonClass}`}
            >
                Agendar
            </button>
        </div>
    );
};