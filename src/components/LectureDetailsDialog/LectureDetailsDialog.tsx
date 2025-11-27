'use client'

import { Lecture } from "@/types/Lecture";
import { api_url } from "@/utils/fetch-url";
import jwtUtils, { getRole } from "@/utils/jwt-utils";
import { Close, School, Person, Room, AccessTime, CalendarToday, WorkspacePremium, MeetingRoom, Stairs, People, Person2Rounded, Person2 } from "@mui/icons-material";
import { useEffect, useState } from "react";

const URL_API = `${api_url}/api/lecture`

export interface ScheduleResult {
    type: 'Recorrente' | 'Determinístico (Aula Única)' | 'Horário Indefinido';
    timeInfo: { label: string; value: string | Element }[];
    dateInfo: { label: string; value: string | Element }[];
}

type LectureDetailsDialogProps = {
    open: boolean;
    lecture: Lecture | null;
    onClose: () => void;
};


export interface StudentLecture {
  lectureId: string;
  name: string;
  personId: string;
  studentCode: string;
  studentId: string;
}


export function LectureDetailsDialog({ open, lecture, onClose }: LectureDetailsDialogProps) {
    const [personsInLecture, setPersonsInLecture] = useState<StudentLecture[]>([]);

    const [isInClass, setIsInClass] = useState(false);

    const userId = jwtUtils.getSub()

    const role = jwtUtils.getRole();

    const formatDateTime = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleString('pt-BR', {
                weekday: 'long',
                day: '2-digit',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return dateString;
        }
    };

    const fetchPersonListData = async () => {
        if(!lecture) return
        
        try {
            const response = await fetch(`${URL_API}/${lecture.id}/person`, {
                headers: {'Content-Type': 'application/json'},
                credentials: 'include'
            });

            const data = await response.json();
            setIsInClass(!personsInLecture.some((data) => data.personId == userId))
            setPersonsInLecture(data);
        }catch(err) {
            console.error(err);
        }; 
    }

    const joinInLecture = async () => {
        if(!lecture) return
        
        try {
            const response = await fetch(`${URL_API}/${lecture.id}/join`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                credentials: 'include'
            });

            await fetchPersonListData();
        }catch(err) {
            console.error(err);
        }; 

    }

    
    const unJoinInLecture = async () => {
        if(!lecture) return
        
        try {
            await fetch(`${URL_API}/${lecture.id}/join`, {
                method: 'DELETE',
                headers: {'Content-Type': 'application/json'},
                credentials: 'include'
            });

            await fetchPersonListData();
        }catch(err) {
            console.error(err);
        }; 

    }

 // Local: Dentro de LectureDetailsDialog

const getScheduleInfo = () => {
    const dateValue = lecture.date?.value;
    const endDate = lecture.endDate;

    const diaDaSemanaMap = {
        '0': 'DOM', '1': 'SEG', '2': 'TER', '3': 'QUA', '4': 'QUI', '5': 'SEX', '6': 'SÁB',
    };
    
    // Objeto padrão de retorno
    let info = {
        type: 'Horário Indefinido',
        displayString: 'Dados de agendamento incompletos ou inválidos.',
        duration: 'N/A'
    };

    // 1. Caso Determinístico (Aula Única) - Baseado em endDate
    if (endDate) {
        const endDateObj = new Date(endDate);
        // Início é 50 minutos antes do Termino
        const startDateObj = new Date(endDateObj.getTime() - (50 * 60 * 1000));
        
        // Formato HH:MM
        const horarioInicio = startDateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        const horarioTermino = endDateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        
        // Formato DD MMM AAAA
        const dataDia = startDateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).toUpperCase().replace('.', '');
        
        info.type = 'Determinístico (Aula Única)';
        // ALTERAÇÃO AQUI: De 'HH:MM-HH:MM Data' para 'HH:MMh às HH:MMh Data'
        info.displayString = `${horarioInicio}h às ${horarioTermino}h ${dataDia}`;
        info.duration = '50 min';
        return info;
    }

    // 2. Caso Recorrente (date.value existe, endDate não)
    if (dateValue && dateValue.length >= 4) {
        const hora = dateValue.substring(0, 2);
        const minuto = dateValue.substring(2, 4);
        const diasIndices = dateValue.substring(4).split('').filter(d => d.length > 0);

        // Calcula o horário de término (Início + 50 minutos)
        let endHour = parseInt(hora, 10);
        let endMinute = parseInt(minuto, 10) + 50;

        if (endMinute >= 60) {
            endHour += Math.floor(endMinute / 60);
            endMinute %= 60;
        }

        // Formata o horário de início e término (apenas hora)
        const horarioInicio = `${hora}:${minuto}`;
        const horarioTermino = `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`;

        // Mapeia os índices de dia para abreviações (SEG, TER, QUA)
        const diasDaSemana = diasIndices
            .map(index => diaDaSemanaMap[index as keyof typeof diaDaSemanaMap])
            .filter(Boolean)
            .join(' '); // Junta com espaço

        info.type = 'Recorrente';
        // ALTERAÇÃO AQUI: De 'HH:MM-HH:MM Dias' para 'HH:MMh às HH:MMh Dias'
        info.displayString = `${horarioInicio}h às ${horarioTermino}h ${diasDaSemana}`;
        info.duration = '50 min';
        return info;
    }

    // 3. Caso Desconhecido ou Dados Faltando
    return info;
};
const calculateStartTime = (endDateString: string) => {
    try {
        const endDate = new Date(endDateString);
        // Subtrai 50 minutos (50 * 60 * 1000 milissegundos)
        const startDateMs = endDate.getTime() - (50 * 60 * 1000);
        return new Date(startDateMs).toLocaleString('pt-BR', {
            weekday: 'long',
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch {
        return "Data de Início Inválida";
    }
};

    const calculateDuration = () => {
        try {
            const start = new Date(lecture.startTime);
            const end = new Date(lecture.endTime);
            const diffMs = end.getTime() - start.getTime();
            const diffMins = Math.floor(diffMs / 60000);
            const hours = Math.floor(diffMins / 60);
            const minutes = diffMins % 60;
            return `${hours}h ${minutes}min`;
        } catch {
            return "N/A";
        }
    };

    const getProfessorName = () => {
        return lecture.professor?.name || `ID: ${lecture.professorId}`;
    };

    const getRoomName = () => {
        return lecture.room?.code || `ID: ${lecture.roomId}`;
    };

    useEffect(() => {
    setIsInClass(personsInLecture.some((data) => data.personId == userId));
    }, [personsInLecture, userId]);

    useEffect(() => {
        if(open && lecture){
            fetchPersonListData()

            console.log(lecture)
        }
    }, [open, lecture])


    if (!open || !lecture) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto animate-slideUp"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-400 p-6 rounded-t-2xl relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full p-2 transition-colors"
                    >
                        <Close />
                    </button>
                    <div className="flex items-center gap-4 text-white">
                        <div className="bg-white/20 p-4 rounded-xl">
                            <School fontSize="large" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">{lecture.subjectName}</h2>
                            <p className="text-blue-100 text-sm mt-1">Detalhes Completos da Aula</p>
                        </div>
                    </div>


                    
                    {role == "STUDENT" && (isInClass ?  (
                    <button className="mt-2 text-blue-400 p-2 border-2 border-white bg-white rounded-lg font-bold cursor-pointer
                    hover:bg-blue-500 hover:text-white transition duration300
                    " onClick={unJoinInLecture}>Sair da sala</button>) : (<button onClick={joinInLecture} className="mt-2 text-white p-2 border-2 border-white rounded-lg font-bold cursor-pointer
                    hover:bg-white hover:text-blue-400 transition duration300
                    ">Entrar na sala</button>))}

                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Grid: Professor e Sala */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Informações do Professor */}
                        <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-4 rounded-lg border border-purple-100">
                            <div className="flex items-center gap-2 text-purple-700 mb-3">
                                <Person />
                                <span className="font-bold">Professor</span>
                            </div>
                            <div className="space-y-2">
                                <p className="text-gray-800 font-semibold text-lg">
                                    {getProfessorName()}
                                </p>
                                {lecture.professor?.academicDegree && (
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <WorkspacePremium fontSize="small" />
                                        <span>{lecture.professor.academicDegree}</span>
                                    </div>
                                )}
                                {lecture.professor?.expertiseArea && (
                                    <div className="text-sm text-gray-600">
                                        <strong>Área:</strong> {lecture.professor.expertiseArea}
                                    </div>
                                )}
                                {!lecture.professor && (
                                    <p className="text-xs text-gray-500 font-mono break-all">
                                        {lecture.professorId}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Informações da Sala */}
                        <div className="bg-gradient-to-br from-green-50 to-teal-50 p-4 rounded-lg border border-green-100">
                            <div className="flex items-center gap-2 text-green-700 mb-3">
                                <MeetingRoom />
                                <span className="font-bold">Sala</span>
                            </div>
                            <div className="space-y-2">
                                <p className="text-gray-800 font-semibold text-lg">
                                    {getRoomName()}
                                </p>
                                {lecture.room?.roomType && (
                                    <div className="text-sm text-gray-600">
                                        <strong>Tipo:</strong> {lecture.room.roomType}
                                    </div>
                                )}
                                {lecture.room?.capacity && (
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <People fontSize="small" />
                                        <span>Capacidade: {lecture.room.capacity} pessoas</span>
                                    </div>
                                )}
                                {lecture.room?.floor && (
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Stairs fontSize="small" />
                                        <span>{lecture.room.floor}º Andar</span>
                                    </div>
                                )}
                                
                                {!lecture.room && (
                                    <p className="text-xs text-gray-500 font-mono break-all">
                                        {lecture.roomId}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Imagem da Sala (se disponível) */}
                    {lecture.room?.imageUrl && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="font-bold text-gray-800 mb-3">Imagem da Sala</h3>
                            <img 
                                src={lecture.room.imageUrl} 
                                alt={`Sala ${lecture.room.code}`}
                                className="w-full h-48 object-cover rounded-lg"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                }}
                            />
                        </div>
                    )}
{(() => {
                        const scheduleInfo = getScheduleInfo();

                        return (
                            <div className="bg-blue-50 p-4 rounded-lg space-y-3 border border-blue-100">
                                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                    <AccessTime />
                                    Horários
                                    <span className="text-xs font-normal text-blue-600 ml-2 bg-blue-100 px-2 py-0.5 rounded-full border border-blue-200">
                                        {scheduleInfo.type}
                                    </span>
                                </h3>
                                
                                {scheduleInfo.type !== 'Horário Indefinido' ? (
                                    // Layout de Duas Colunas para informações principais
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        {/* Coluna 1: Horário e Recorrência/Data */}
                                        <div>
                                            <span className="text-gray-600 font-semibold">
                                                {scheduleInfo.type === 'Recorrente' ? 'Horário/Dias' : 'Data/Hora'}
                                            </span>
                                            <p className="text-gray-900 font-bold text-lg mt-1 break-words">
                                                {scheduleInfo.displayString}
                                            </p>
                                        </div>

                                        {/* Coluna 2: Duração */}
                                        <div>
                                            <span className="text-gray-600 font-semibold">Duração</span>
                                            <p className="text-blue-600 font-bold text-lg mt-1">
                                                {scheduleInfo.duration}
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    // Caso de Erro/Indefinido
                                    <div className="text-sm">
                                        <span className="text-gray-600 font-semibold">Status:</span>
                                        <p className="text-red-500 font-medium mt-1 italic">
                                            {scheduleInfo.displayString}
                                        </p>
                                    </div>
                                )}
                            </div>
                        );
                    })()}
                   <div className="bg-gray-50 p-4 rounded-lg space-y-3">
    <h3 className="font-bold text-gray-800 flex items-center gap-2">
        <Person2 />
        Alunos cadastrados ({personsInLecture.length} no total)
    </h3>
    
    {/* Lista de alunos iterada a partir do estado personsInLecture */}
    <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
        {personsInLecture.length > 0 ? (
            personsInLecture.map((student) => (
                <div 
                    key={student.personId} 
                    className={`flex justify-between items-center p-2 rounded-lg 
                                ${student.personId === userId ? 'bg-blue-100 border-l-4 border-blue-500' : 'bg-white border border-gray-200'}`}
                >
                    <div className="flex items-center gap-2">
                        <Person fontSize="small" className={`
                            ${student.personId === userId ? 'text-blue-600' : 'text-gray-500'}
                        `} />
                        <span className={`font-medium ${student.personId === userId ? 'text-blue-800' : 'text-gray-800'}`}>
                            {student.name}
                            {student.personId === userId && <span className="text-xs text-blue-500 ml-2">(Você)</span>}
                        </span>
                    </div>
                    <span className="text-xs text-gray-600 font-mono bg-gray-100 px-2 py-0.5 rounded">
                        Matrícula: **{student.studentCode}**
                    </span>
                </div>
            ))
        ) : (
            <p className="text-gray-500 italic p-2">Nenhum aluno registrado na aula.</p>
        )}
    </div>

    {/* O bloco de "Informações do Sistema" que você tinha (ID, CreatedAt, UpdatedAt) */}
</div>

                    {/* Metadados */}
                   { getRole() == "ADMIN" && (<div className="bg-gray-50 p-4 rounded-lg space-y-3">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2">
                            <CalendarToday />
                            Informações do Sistema
                        </h3>

                        
                        <div className="space-y-2 text-sm">
                            <div>
                                <span className="text-gray-600 font-semibold">ID da Aula:</span>
                                <p className="text-gray-800 font-mono mt-1 break-all">{lecture.id}</p>
                            </div>
                            <div>
                                <span className="text-gray-600 font-semibold">Criado em:</span>
                                <p className="text-gray-800 mt-1">{formatDateTime(lecture.createdAt)}</p>
                            </div>
                            <div>
                                <span className="text-gray-600 font-semibold">Última atualização:</span>
                                <p className="text-gray-800 mt-1">{formatDateTime(lecture.updatedAt)}</p>
                            </div>
                        </div>
                    </div>)}
                </div>

                {/* Footer */}
                <div className="bg-gray-50 p-4 rounded-b-2xl flex justify-end">
                    <button
                        onClick={onClose}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
}