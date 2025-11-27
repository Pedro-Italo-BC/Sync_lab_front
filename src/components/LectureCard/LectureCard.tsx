'use client'

import { Lecture } from "@/types/Lecture";
import { School, AccessTime, Room, Person, MeetingRoom } from "@mui/icons-material";

type LectureCardProps = {
    lecture: Lecture;
    onViewDetails: () => void;
};

export function LectureCard({ lecture, onViewDetails }: LectureCardProps) {
    const formatDateTime = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return dateString;
        }
    };

    const getProfessorName = () => {
        if (lecture.professor?.name) {
            return lecture.professor.name;
        }
        return `Professor ID: ${lecture.professorId.substring(0, 8)}...`;
    };

    const getRoomInfo = () => {
        if (lecture.room?.code) {
            return `Sala ${lecture.room.code} - ${lecture.room.roomType}`;
        }
        return `Sala ID: ${lecture.roomId.substring(0, 8)}...`;
    };

    const getRoomCapacity = () => {
        if (lecture.room?.capacity) {
            return `Capacidade: ${lecture.room.capacity} pessoas`;
        }
        return null;
    };

    return (
        <div
            onClick={onViewDetails}
            className="group relative bg-white rounded-xl shadow-md overflow-hidden cursor-pointer transition-all duration-500 ease-out hover:shadow-2xl hover:-translate-y-1"
        >
            {/* Conteúdo Principal */}
            <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-3 rounded-lg">
                            <School className="text-blue-600" fontSize="large" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-800 line-clamp-1">
                                {lecture.subjectName}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                                ID: {lecture.id.substring(0, 8)}...
                            </p>
                        </div>
                    </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                        <Person fontSize="small" className="text-gray-400" />
                        <span className="font-semibold">{getProfessorName()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <MeetingRoom fontSize="small" className="text-gray-400" />
                        <span className="font-semibold">{getRoomInfo()}</span>
                    </div>
                    {getRoomCapacity() && (
                        <div className="flex items-center gap-2 ml-6 text-xs text-gray-500">
                            <span>{getRoomCapacity()}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-2">
                        <AccessTime fontSize="small" className="text-gray-400" />
                        <span>Início: {formatDateTime(lecture.startTime)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <AccessTime fontSize="small" className="text-gray-400" />
                        <span>Fim: {formatDateTime(lecture.endTime)}</span>
                    </div>
                </div>
            </div>

            {/* Overlay de Detalhes (aparece no hover) */}
            <div className="absolute inset-0 bg-gradient-to-t from-blue-600 to-blue-400 opacity-0 group-hover:opacity-95 transition-opacity duration-500 ease-out flex flex-col justify-end p-6 text-white">
                <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 ease-out">
                    <h4 className="text-lg font-bold mb-3">Detalhes da Aula</h4>
                    <div className="space-y-2 text-sm">
                        <p><strong>Professor:</strong> {getProfessorName()}</p>
                        {lecture.professor?.academicDegree && (
                            <p><strong>Titulação:</strong> {lecture.professor.academicDegree}</p>
                        )}
                        {lecture.professor?.expertiseArea && (
                            <p><strong>Área:</strong> {lecture.professor.expertiseArea}</p>
                        )}
                        <div className="pt-2 border-t border-white/30 mt-2">
                            <p><strong>Sala:</strong> {getRoomInfo()}</p>
                            {lecture.room?.capacity && (
                                <p><strong>Capacidade:</strong> {lecture.room.capacity} pessoas</p>
                            )}
                            {lecture.room?.floor && (
                                <p><strong>Andar:</strong> {lecture.room.floor}º</p>
                            )}
                       
                        </div>
                        <p className="pt-2"><strong>Criado em:</strong> {formatDateTime(lecture.createdAt)}</p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-white/30">
                        <p className="text-center font-semibold">Clique para ver mais detalhes</p>
                    </div>
                </div>
            </div>
        </div>
    );
}