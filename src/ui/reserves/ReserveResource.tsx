import React, { FormEvent, useCallback, useEffect, useState } from "react";
import { api_url } from "@/utils/fetch-url";
import toast from "react-hot-toast";
import { ResourceCard } from "@/components/ResourceCard/ResourceCard";
import { ElegantButtom } from "@/components/ElegantButton/ElegantButton";
import { Modal } from "@/components/Modal/Modal";
import { RecommendationCard } from "@/components/RecommendationCard/RecommendationCard";
import { Button, FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { NumberField } from '@base-ui-components/react/number-field';
import { Cached } from "@mui/icons-material";
import jwtUtils from "@/utils/jwt-utils";
const API_BASE_URL = `${api_url}/api`;

type Tab = "reservas" | "agendar";
type ResourceItemStatus = "Disponível" | "Indisponível";

type ResourceItem = {
    id: string;
    name: string;
    description: string;
    status: ResourceItemStatus;
    imageUrl: string;
}

type ReserveResourceProps = {
    setActiveTab: (tab: Tab) => void
}

export type RoomResource = {
    id: string
    capacity: number;
    roomType: string;
    code: string;
    status: string;
    imageUrl: string;
    buildingId: string;
    floor: number;
    createdAt: Date;
    updatedAt: Date;
}

type RecommendationResourceType = {
    roomRecommendations: RoomResource[]
}

type formDataType = {
    date: string,
    timeStart: string,
    timeEnd: string,
    purpose: string,
    subjectName: string
}

interface Course {
    id?: string;
    name: string;
    acg: string;
    schedule: string;
    createdAt?: string;
    updatedAt?: string;
}

// Componente da página de agendamento.
// Componete responsável pela listagem de recursos que podem ser agendados
export function ReserveResource({ setActiveTab }: ReserveResourceProps) {
    // Itens obtidos após o fetch.
    const [tools, setTools] = useState<ResourceItem[]>([]);
    const [rooms, setRooms] = useState<ResourceItem[]>([]);
    const [events, setEvents] = useState<ResourceItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [recommendationResource, setRecommendationResource] = useState<RecommendationResourceType>({
        roomRecommendations: []
    });
    const [formData, setFormData] = useState<formDataType>({} as formDataType)
    const [selectedAmount, setSelectedAmount] = useState(20);
    const [courses, setCourses] = useState<Course[]>([]);
    const [selectedCourse, setSelectedCourse] = useState<Course | null>({} as Course);
    const id = React.useId();

    // Responsáveis pelo modal do agendamento
    const [selectedItem, setSelectedItem] = useState<ResourceItem | null>(null);
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [loadinRecommendationData, setLoadinRecommendationData] = useState(false);

    const isRoomOrEventSelected = selectedItem && (rooms.some(r => r.id === selectedItem.id) || events.some(e => e.id === selectedItem.id));

    const role = jwtUtils.getRole();


    async function handleSubmit() {
        const isRoomOrEvent = rooms.some(r => r.id === selectedItem?.id) || events.some(e => e.id === selectedItem?.id);
        const isEquipment = tools.some(t => t.id === selectedItem?.id);

        if (!selectedItem || !formData.date || !formData.timeStart || !formData.purpose) {
            toast.error("Por favor, preencha todos os campos obrigatórios.");
            return;
        }

        if (isRoomOrEvent && !formData.subjectName) {
            toast.error("Para reservas de Salas/Eventos, o campo 'Nome da Disciplina' é obrigatório.");
            return;
        }

        const isoDateTimeStart = `${formData.date}T${formData.timeStart}:00.000Z`;
        const isoDateTimeEnd = `${formData.date}T${formData.timeEnd}:00.000Z`;

        const endpoint = isEquipment ? "equipment" : "room";

        let payload: any = {}

        if (isEquipment) {
            payload = {
                "reservation": {
                    "purpose": formData.purpose,
                    "startTime": isoDateTimeStart,
                },
                ["equipment"]: {
                    "id": selectedItem.id
                }
            }
        } else {
            payload = {
                "reservation": {
                    "purpose": formData.purpose,
                    "startTime": isoDateTimeStart,
                },
                ["room"]: {
                    "id": selectedItem.id
                },
                "lecture": {
                    "courseId": selectedCourse?.id
                }
            }

        };


        try {
            const response = await fetch(`${API_BASE_URL}/reservation/${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.erro || `Erro HTTP ${response.status}: ${response.statusText}`);
            }

            toast.success(`Solicitação enviada com sucesso!`);

            setSelectedItem(null);
            setFormData({ date: "", timeStart: "", timeEnd: "", purpose: "", subjectName: "" });
            fetchData();

        } catch (e: any) {
            toast.error(`Falha ao enviar a reserva: ${e.message}`);
        }
    }

    async function fetchRecommendation() {
        let data = null;
        try {
            const response = await fetch(`${API_BASE_URL}/reservation/recommendation`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include'
            });

            data = await response.json();
        } catch (e) {
            console.error(e);
        }

        return data;
    }

    function mapBackendResourceToFrontend(item: any): ResourceItem {
        const statusText: ResourceItemStatus = item.status === 'FREE' || item.status === 'Available' ? "Disponível" : "Indisponível";

        let description = item.description || (item.roomType && item.code ? `Tipo: ${item.roomType}, Código: ${item.code}` : "");
        let name = item.name || item.code || item.roomType;

        return {
            id: item.id,
            name: name,
            description: description,
            status: statusText,
            imageUrl: item.imageUrl || '',
        };
    }

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const toolsResponse = await fetch(`${API_BASE_URL}/equipment`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                credentials: 'include'
            });

            if (!toolsResponse.ok) {
                throw new Error("Falha ao buscar ferramentas.");
            }

            const toolsData = await toolsResponse.json();
            setTools(toolsData.map(mapBackendResourceToFrontend));

            const roomsResponse = await fetch(`${API_BASE_URL}/room`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                credentials: 'include'
            });
            if (!roomsResponse.ok) throw new Error("Falha ao buscar salas/eventos.");
            const roomsData = await roomsResponse.json();

            const allRooms = roomsData.map(mapBackendResourceToFrontend);

            const filteredRooms = allRooms.filter((item: ResourceItem) => item.name !== 'AUDITORIO');
            const filteredEvents = allRooms.filter((item: ResourceItem) => item.name === 'AUDITORIO');

            setRooms(filteredRooms);
            setEvents(filteredEvents);
        } catch (error: any) {
            console.error(error);
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    }, [])

    async function fetchCourses() {
        try {
            const resp = await fetch(`${API_BASE_URL}/course`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                credentials: "include"
            })
            const data: Course[] = await resp.json();
            setCourses(data);
            console.log(courses)
        } catch (error) {
            console.error(error);
        } finally {
        }
    }

    async function fetchRecommendationRooms() {
        try {
            setLoadinRecommendationData(true);
            const response = await fetchRecommendation();
            setRecommendationResource(response);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadinRecommendationData(false);
        }
    }

    function handleReserve(item: ResourceItem) {
        setSelectedItem(item);
    }

    function renderSection(title: string, items: ResourceItem[]) {
        return (
            <div className="mb-8">
                <h2 className="text-xl font-bold mb-4">{title}</h2>
                {items.length === 0 && !isLoading && !error && <p className="text-gray-500">Nenhum item disponível nesta categoria.</p>}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map((item) => (
                        <ResourceCard key={item.id} item={item} onReserve={handleReserve} />
                    ))}
                </div>
            </div>
        )
    }

    useEffect(() => {
        fetchData();
        fetchCourses();
    }, [fetchData]);

    return (
        <main className="bg-[var(--foreground)] flex-1 rounded-lg p-8 flex flex-col">
            <div className="flex gap-4 justify-between">
                <div className="flex gap-4 mb-6 w-full">
                    <button
                        onClick={() => setActiveTab('agendar')}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-semibold"
                    >
                        Agendar Recurso
                    </button>
                    <button
                        onClick={() => setActiveTab('reservas')}
                        className="px-4 py-2 bg-gray-300 border-2 border-gray-300 text-black rounded-lg hover:bg-gray-400 transition"
                    >
                        Meus Agendamentos
                    </button>
                </div>
                {role != "STUDENT" && (
                    <ElegantButtom text="Recomendação Inteligente" onClick={async () => {
                        setOpenModal(true)

                        if(recommendationResource.roomRecommendations.length == 0) {
                            await fetchRecommendationRooms();
                        }
                    }} />
                )}

                {openModal && <Modal title="Recomendação Inteligente" handleClose={() => {
                    setOpenModal(false);
                }}>

                    <div className="flex h-full gap-11 w-full flex-col">

                        <header>
                            <button
                                onClick={() => fetchRecommendationRooms()}
                                disabled={loadinRecommendationData}
                                className="px-4 py-2 bg-gray-300 border-2 border-gray-300 text-black rounded-lg hover:bg-gray-400 transition disabled:cursor-not-allowed disabled:brightness-80 disabled:hover:bg-gray-300"
                            >
                                <Cached/>
                            </button>

                        </header>
                        <div className="h-full w-full">
                            {
                                recommendationResource == null || recommendationResource.roomRecommendations.length === 0 || loadinRecommendationData ? (
                                    loadinRecommendationData ? (
                                        <p className="text-center w-full">Carregando...</p>
                                    ) : (
                                        <p className="text-center w-full">
                                            Infelizmente, não há recursos para recomendar.
                                        </p>
                                    )
                                ) : (
                                    recommendationResource.roomRecommendations.map((element, index) => (
                                        <RecommendationCard key={index} dataRoom={element} handleReserve={() => setSelectedItem({
                                            id: element.id,
                                            name: element.code,
                                            description: "",
                                            status: element.status as ResourceItemStatus,
                                            imageUrl: element.imageUrl
                                        })} />
                                    ))
                                )
                            }
                        </div>

                    </div>
                </Modal>}

            </div>

            <h1 className="text-2xl font-bold text-black mb-6">Novo Agendamento</h1>

            {isLoading && <p className="text-center text-lg my-10"> Carregando itens...</p>}
            {error && <p className="text-center text-red-500 text-lg my-10">Erro ao carregar dados: {error}</p>}

            <div className="flex-1 overflow-y-auto pr-2">
                {!isLoading && !error && (
                    <>
                        {role != 'STUDENT' && <hr className="my-6 border-gray-200" />}
                        {role != 'STUDENT' && renderSection("Salas e Laboratórios", rooms)}
                        <hr className="my-6 border-gray-200" />
                        {renderSection("Ferramentas", tools)}
                    </>
                )}
            </div>

            {selectedItem && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex justify-center items-center z-50">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
                        <button
                            onClick={() => setSelectedItem(null)}
                            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                        >
                            ✕
                        </button>
                        <h2 className="text-xl font-bold mb-4">
                            Agendar: {selectedItem.name}
                        </h2>

                        <div className="flex flex-col gap-4">

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Dia</label>
                                <input
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg p-2"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Horário de Início</label>
                                <input
                                    type="time"
                                    value={formData.timeStart}
                                    onChange={(e) => setFormData({ ...formData, timeStart: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg p-2"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Propósito da Reserva</label>
                                <input
                                    type="text"
                                    placeholder="Ex: Reunião de equipe"
                                    value={formData.purpose}
                                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg p-2"
                                    required
                                />
                            </div>

                            {isRoomOrEventSelected && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Disciplina (Para agendamento de Aula)</label>
                                        <input
                                            type="text"
                                            placeholder="Ex: Cálculo I"
                                            value={formData.subjectName}
                                            onChange={(e) => setFormData({ ...formData, subjectName: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg p-2"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Curso (Para agendamento de Aula)</label>

                                        <FormControl>
                                            <InputLabel id="course-select-label">Curso</InputLabel>
                                            <Select
                                                labelId="course-select-label"
                                                id="course-select"
                                                label="Curso"
                                                defaultValue=""
                                                sx={{
                                                    height: 50,
                                                    minWidth: 216,
                                                }}
                                                onChange={(event) => {
                                                    const courseName = event.target.value;
                                                    const courseObj = courses.find((c) => c.name === courseName);

                                                    setSelectedCourse(courseObj ? courseObj : null);
                                                }}
                                            >
                                                {courses.map((course) => (
                                                    <MenuItem key={course.id} value={course.name}>
                                                        {course.name}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </div>
                                </>


                            )}
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    onClick={() => setSelectedItem(null)}
                                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                                >
                                    Enviar solicitação
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );

}