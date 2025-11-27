import { Trash } from "phosphor-react";

type DisplayReservation = {
    reservation_id: string;
    resource_type: 'Sala' | 'Equipamento' | string;
    purpose: string;
    start_time: string;
    end_time: string;
    status: 'Pendente' | 'Confirmado' | 'Recusado' | string;
};

type EditReservationModalProps = {
    selectedReservation: DisplayReservation;
    handleCloseModal: () => void;
    handleSaveChanges: (e: React.FormEvent) => void;
    handleCancelReservation: () => void;
    registerModal: any;
}

export function EditReservationModal({handleCancelReservation, handleCloseModal,handleSaveChanges, registerModal, selectedReservation}: EditReservationModalProps) { 
    return (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex justify-center items-center z-50">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
            <button
                onClick={handleCloseModal}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
                ✕
            </button>

            <h2 className="text-xl font-bold mb-4">Editar Reserva</h2>

            <p className="text-gray-700 mb-4">
                <strong>{selectedReservation.purpose}</strong> <br />
                {selectedReservation.resource_type} –{" "}
                {new Date(selectedReservation.start_time).toLocaleString()}
            </p>

            <form onSubmit={handleSaveChanges}>
                <label className="block mb-2 font-semibold text-sm">Editar Proposta</label>
                <input
                    type="text"
                    {...registerModal('porpose')}
                    className="w-full mb-4 p-2 border rounded-lg"
                    required
                />

                <div className="flex justify-between items-center mt-6">
                    <button
                        type="button"
                        onClick={handleCancelReservation}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition cursor-pointer"
                        title="Cancelar reserva"
                    >
                        <Trash size={18} />
                        Cancelar Reserva
                    </button>

                    <button
                        type="submit"
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition cursor-pointer font-semibold"
                    >
                        Salvar alterações
                    </button>
                </div>
            </form>
        </div>
    </div>
    );
}