'use client'

import { useState, useEffect, useCallback } from "react";
import { ArrowBack } from "@mui/icons-material";
import Link from "next/link";
import { ReservationDetailsDialog } from "@/components/ReservationDetailDialog/ReservationDetailsDialog";
import { ReservationApprovalCard } from "@/components/ReservationApprovalCard/ReservationApprovalCard";
import { api_url } from "@/utils/fetch-url";
import toast from "react-hot-toast";

const API_BASE_URL = `${api_url}/api`; 

export type Reservation = {
    id: string;
    resource_type: "Sala" | "Equipamento" | "Evento"; 
    purpose: string;
    start_time: string; 
    end_time: string; 
    status: string; 
    imageUrl: string; 
    
    resourceId: string;
    requesterId: string;

    user: {
        name: string;
        email: string; 
        avatar: string; 
        role: string;
    };
    
    resource_details: {
        name: string;
        description: string;
        code?: string;       
        capacity?: number;   
        quantity?: number;   
    };
};

export default function ApprovalsPage() {
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);



const mapBackendToFrontend = (backendItem: any): Reservation => {
    
    const resourceTypeMap: { [key: string]: "Sala" | "Equipamento" | "Evento" } = {
        'EQUIPMENT': 'Equipamento',
        'ROOM': 'Sala',
    };
    
    const resourceRef = backendItem.equipmentRef || backendItem.room;
    
    const resourceName = resourceTypeMap[backendItem.resourceType?.toUpperCase()] || 
                         (backendItem.resourceType === 'Equipment' ? 'Equipamento' : 
                         (backendItem.resourceType === 'Room' ? 'Sala' : 'Evento'));
    
    const requesterData = backendItem.personRef || {};
    
    const requesterName = requesterData.name || "Usuário Desconhecido";
    const requesterIdentifier = requesterData.personCode || "N/A"; 
    
    const resourceId = backendItem.equipmentId || backendItem.roomId || "N/A";
    
    // Lógica para preencher resource_details
    let details: Reservation['resource_details'];

    if (backendItem.equipmentRef) {
        details = {
            name: resourceRef.name || 'Equipamento Desconhecido',
            description: resourceRef.description || 'Sem descrição',
            quantity: resourceRef.quantity,
        };
    } else if (backendItem.room) {
        details = {
            name: resourceRef.code || resourceRef.name || 'Sala Desconhecida',
            description: resourceRef.roomType || 'Sem tipo',
            code: resourceRef.code,
            capacity: resourceRef.capacity,
        };
    } else {
        details = {
            name: resourceName,
            description: 'Detalhes indisponíveis',
        };
    }

    return {
        id: backendItem.id,
        resource_type: resourceName, 
        purpose: backendItem.purpose || "Sem descrição de propósito",
        start_time: backendItem.startTime, 
        end_time: backendItem.endTime || backendItem.startTime, 
        status: backendItem.status,
        
        imageUrl: resourceRef?.imageUrl || '/placeholder.png', 
        
        resourceId: resourceId, 
        requesterId: backendItem.personId, 
        
        user: {
            name: requesterName,
            email: requesterIdentifier,
            avatar: requesterData.profileUrl || "/default-avatar.png", 
            role: requesterData.role || "N/A", 
        },
        
        resource_details: details
    };
};
    const fetchPendingReservations = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/reservation/status/Pending`, {
                headers: { "Content-Type": "application/json" },
                credentials: 'include' 
            });

            if (!response.ok) {
                 const errorBody = await response.json();
                 throw new Error(errorBody.erro || `Falha HTTP: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            
            const mappedReservations = data.map(mapBackendToFrontend);
            setReservations(mappedReservations);

        } catch (err: any) {
            console.error("Erro ao buscar reservas pendentes:", err);
            setError(`Não foi possível carregar as reservas: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPendingReservations();
    }, [fetchPendingReservations]);

    const handleAction = async (reservationId: string, action: 'approve' | 'reject') => {
        if (!confirm(`Tem certeza que deseja ${action === 'approve' ? 'APROVAR' : 'REJEITAR'} esta reserva?`)) return;

        try {
            const endpoint = `${API_BASE_URL}/reservation/${action}/${reservationId}`;
            
            const response = await fetch(endpoint, {
                method: 'PUT',
                headers: { "Content-Type": "application/json" },
                credentials: 'include' 
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.erro || `Erro HTTP ${response.status}: ${result.mensagem || response.statusText}`);
            }

            toast.success(`Sucesso! ${result.mensagem}`);
            
            fetchPendingReservations();
            setSelectedReservation(null);

        } catch (e: any) {
            toast.error(`Falha ao processar a ação: ${e.message}`);
        }
    };

    return (
        <div className="flex w-full h-screen gap-8">
            <div className="w-28 h-full flex flex-col gap-2.5">
                <Link
                    href="/admin"
                    className="bg-[var(--foreground)] w-full flex justify-center items-center h-12 rounded-lg hover:bg-red-500 hover:text-white cursor-pointer duration-300 transition"
                >
                    <ArrowBack />
                </Link>
            </div>

            <main className="bg-[var(--foreground)] flex-1 h-full rounded-lg p-8 flex flex-col overflow-y-auto">
                <h1 className="text-2xl font-bold text-black mb-6">Aprovar Agendamentos</h1>

                {isLoading && <p className="text-center text-lg my-10">Carregando pedidos pendentes...</p>}
                {error && <p className="text-center text-red-500 text-lg my-10">Erro: {error}</p>}
                
                {!isLoading && !error && reservations.length === 0 && (
                     <div className="text-center text-gray-500 p-10 bg-white rounded-lg">
                        <p className="text-xl font-semibold"> Nenhum pedido pendente no momento!</p>
                        <p className="mt-2">Todos os agendamentos foram processados.</p>
                     </div>
                )}
                
                <div className="flex-1 mt-6 pr-2 flex flex-col gap-6">
                    {reservations.map((res) =>  {
                        console.log(res)
                        
                        return (
                        <ReservationApprovalCard
                            key={res.id}
                            reservation={res}
                            onViewDetails={() => setSelectedReservation(res)}
                            onApprove={() => handleAction(res.id, 'approve')}
                            onReject={() => handleAction(res.id, 'reject')}
                        />
                    )})}
                </div>
            </main>

            <ReservationDetailsDialog
                open={!!selectedReservation}
                reservation={selectedReservation}
                onClose={() => setSelectedReservation(null)}
                approve ={() => handleAction(selectedReservation.id, 'approve')}
                reject ={() => handleAction(selectedReservation.id, 'approve')}
            />
        </div>
    );
}