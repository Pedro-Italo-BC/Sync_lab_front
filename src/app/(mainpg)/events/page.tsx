'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from "react";
import { LectureCard } from "@/components/LectureCard/LectureCard";
import { LectureDetailsDialog } from "@/components/LectureDetailsDialog/LectureDetailsDialog";
import { Lecture } from "../../../types/Lecture";
import { api_url } from "@/utils/fetch-url";

const API_BASE_URL = `${api_url}/api`;

export default function LecturesPage() {
    const [lectures, setLectures] = useState<Lecture[]>([]);
    const [selectedLecture, setSelectedLecture] = useState<Lecture | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchLectures = useCallback(async () => {
        if (typeof window === "undefined") return; // evita SSR
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/lectures`, {
                headers: { "Content-Type": "application/json" },
                credentials: 'include'
            });

            if (!response.ok) {
                const errorBody = await response.json();
                throw new Error(errorBody.erro || `Falha HTTP: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            setLectures(data);

        } catch (err: any) {
            console.error("Erro ao buscar aulas:", err);
            setError(`Não foi possível carregar as aulas: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchLectures();
    }, [fetchLectures]);

    return (
        <div className="flex w-full h-screen gap-8">
            {/* Conteúdo Principal */}
            <main className="bg-[var(--foreground)] flex-1 h-full rounded-lg p-8 flex flex-col overflow-y-auto">
                <h1 className="text-2xl font-bold text-black mb-6">Listagem de Aulas</h1>

                {isLoading && (
                    <p className="text-center text-lg my-10">Carregando aulas...</p>
                )}
                
                {error && (
                    <p className="text-center text-red-500 text-lg my-10">Erro: {error}</p>
                )}
                
                {!isLoading && !error && lectures.length === 0 && (
                    <div className="text-center text-gray-500 p-10 bg-white rounded-lg">
                        <p className="text-xl font-semibold">Nenhuma aula cadastrada no momento!</p>
                        <p className="mt-2">Aguarde o cadastro de novas aulas.</p>
                    </div>
                )}
                
                {/* Grid de Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                    {typeof window !== "undefined" && lectures.map((lecture) => (
                        <LectureCard
                            key={lecture.id}
                            lecture={lecture}
                            onViewDetails={() => setSelectedLecture(lecture)}
                        />
                    ))}
                </div>
            </main>

            {/* Modal de Detalhes */}
            {typeof window !== "undefined" && (
                <LectureDetailsDialog
                    open={!!selectedLecture}
                    lecture={selectedLecture}
                    onClose={() => setSelectedLecture(null)}
                />
            )}
        </div>
    );
}
