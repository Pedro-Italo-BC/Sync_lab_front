'use client';

import { EditReservationModal } from "@/components/EditReservationModal/EditReservationModal";
import { ReservationItem } from "@/components/ReservationItem/ReservationItem";
import { api_url } from "@/utils/fetch-url";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

const API_BASE_URL = `${api_url}/api`;

type Tab = 'reservas' | 'agendar';

type MyReservationsProps = { 
    setActiveTab: (tab: Tab) => void;
}

type ModalForm = {
    porpose: string;
}

type Reservation = {
    id: string;
    personId: string;
    equipmentId: string | null;
    roomId: string | null;
    resourceType: string;
    purpose: string;
    startTime: string;
    endTime: string;
    status: 'Pending' | 'Approved' | 'Rejected' | string;
};

type DisplayReservation = {
    reservation_id: string;
    resource_type: 'Sala' | 'Equipamento' | string;
    purpose: string;
    start_time: string;
    end_time: string;
    status: 'Pendente' | 'Confirmado' | 'Recusado' | string;
};

type FilterForm = {
    resource_type?: string;
    status?: string;
    purpose?: string;
};

export function MyReservations({setActiveTab}: MyReservationsProps) {
    const [reservations, setReservations] = useState<DisplayReservation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState<FilterForm>({});
    const [selectedReservation, setSelectedReservation] = useState<DisplayReservation | null>(null);
    
    const { register: registerModal, handleSubmit: handleSubmitModal, setValue } = useForm<ModalForm>();

    const filteredReservations = reservations.filter((res) => {
        const filterTypeDisplay = filters.resource_type === 'Sala' ? 'Sala' : filters.resource_type === 'Equipamento' ? 'Equipamento' : undefined;

        const matchesType = filterTypeDisplay ? res.resource_type === filterTypeDisplay : true;
        const matchesStatus = filters.status ? res.status === filters.status : true;
        const matchesPurpose = filters.purpose
            ? res.purpose.toLowerCase().includes(filters.purpose.toLowerCase())
            : true;
        return matchesType && matchesStatus && matchesPurpose;
    });

    function onSubmit(data: FilterForm) {
        setFilters(data);
    }

    function handleEdit(reservation: DisplayReservation) {
        setSelectedReservation(reservation);
        setValue("porpose", reservation.purpose);
    }

    function handleCloseModal() {
        setSelectedReservation(null);
    }

    const handleSaveChanges = handleSubmitModal(async (data: ModalForm) =>  {
        const obj = selectedReservation;

        if(obj) {
            let payload: any = {
                "reservation": {
                    "purpose": data.porpose,
                }
            };

            if(selectedReservation) {
                await fetch(`${API_BASE_URL}/reservation/${selectedReservation.reservation_id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify(payload),
                });

                toast.success(`Alterações salvas com sucesso Reserva`);
                handleCloseModal();
            }
        }
    });    

    async function handleCanecelReservation() {
        if(selectedReservation) {
            const confirmation = window.confirm(`Tem certeza que deseja cancelar a reserva ${selectedReservation.purpose}?`);

            await fetch(`${API_BASE_URL}/reservation/${selectedReservation.reservation_id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });

            if (confirmation) {
                toast.success(`Reserva cancelada.`);
                handleCloseModal();
                fetchMyReservations();
            }
        }
    }

    function mapBackendToDisplay(backendItem: Reservation): DisplayReservation {
        const resourceTypeDisplay = backendItem.resourceType === 'Room' ? 'Sala' : 'Equipamento';

        let statusDisplay: DisplayReservation['status'] = 'Desconhecido';
        if (backendItem.status === 'Pending') statusDisplay = 'Pendente';
        else if (backendItem.status === 'Approved' || backendItem.status == "FREE") statusDisplay = 'Confirmado';
        else if (backendItem.status === 'Rejected') statusDisplay = 'Recusado';

        return {
            reservation_id: backendItem.id,
            resource_type: resourceTypeDisplay,
            purpose: backendItem.purpose || "Sem propósito",
            start_time: backendItem.startTime,
            end_time: backendItem.endTime,
            status: statusDisplay,
        };
    }

    async function handleCancelReservation() {
        if(selectedReservation) {
             const confirmation = window.confirm(`Tem certeza que deseja cancelar a reserva ${selectedReservation.purpose}?`);

            await fetch(`${API_BASE_URL}/reservation/${selectedReservation.reservation_id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });

            if (confirmation) {
                toast.success(`Reserva cancelada.`);
                handleCloseModal();
                fetchMyReservations();
            }
        }
    }

    const fetchMyReservations = useCallback(async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch(`${API_BASE_URL}/reservation/person`, {
                    headers: { "Content-Type": "application/json" },
                    credentials: 'include'
                });
    
                if (!response.ok) {
                    const errorBody = await response.json();
                    if (response.status === 401) {
                        throw new Error("Não autenticado. Faça login novamente.");
                    }
                    throw new Error(errorBody.erro || `Falha HTTP: ${response.status} ${response.statusText}`);
                }
    
                const data: Reservation[] = await response.json();
                const mappedReservations = data.map(mapBackendToDisplay);
                setReservations(mappedReservations);
    
            } catch (err: any) {
                setError(`Não foi possível carregar suas reservas: ${err.message}`);
            } finally {
                setIsLoading(false);
            }
        }, []);
    
        useEffect(() => {
            fetchMyReservations();
        }, [fetchMyReservations]);
    

    return (
        <main className="bg-[var(--foreground)] flex-1 h-full rounded-lg p-8 flex flex-col">

            <div className="flex gap-4 mb-6">
                <button
                    onClick={() => setActiveTab('agendar')}
                    className="px-4 py-2 bg-gray-300 text-black rounded-lg hover:bg-gray-400 transition"
                >
                    Agendar Recurso
                </button>
                <button
                    onClick={() => setActiveTab('reservas')}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-semibold"
                >
                    Meus Agendamentos
                </button>
            </div>

            <h1 className="text-2xl font-bold text-black mb-6">Meus Agendamentos</h1>


            {isLoading && <p className="text-center text-lg my-10"> Carregando suas reservas...</p>}
            {error && <p className="text-center text-red-500 text-lg my-10">Erro: {error}</p>}

            <div className="flex-1 overflow-y-auto pr-2">
                <div className="flex flex-col gap-6">
                    {!isLoading && !error && filteredReservations.length === 0 && (
                        <div className="text-center text-gray-500 p-10 bg-white rounded-lg">
                            <p className="text-xl font-semibold">Nenhuma reserva encontrada.</p>
                            <p className="mt-2">Ajuste os filtros ou crie um novo agendamento.</p>
                        </div>
                    )}

                    {!isLoading && !error && filteredReservations.map((res) => (
                        <ReservationItem
                            key={res.reservation_id}
                            res={res}
                            onEdit={handleEdit}
                        />
                    ))}
                </div>
            </div>

            {selectedReservation && (
                <EditReservationModal
                    selectedReservation={selectedReservation}
                    handleCloseModal={handleCloseModal}
                    handleSaveChanges={handleSaveChanges}
                    handleCancelReservation={handleCancelReservation}
                    registerModal={registerModal}
                />
            )}
        </main>
    );
}