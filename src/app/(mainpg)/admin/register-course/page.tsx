"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";

const Input = (props: any) => <input {...props} />;

import { ArrowBack, Edit, Delete, Add, Save, Cancel, Sync, Image } from "@mui/icons-material";
import { api_url } from "@/utils/fetch-url";
 
const toast = { 
    success: (msg: string) => console.log(`SUCCESS: ${msg}`), 
    error: (msg: string) => console.error(`ERROR: ${msg}`) 
};


const API_BASE_URL = `${api_url}/api`;
const ENTITY_TYPE = 'course';

interface Course {
    id?: string;
    name: string;
    acg: string;  
    schedule: string;  
    createdAt?: string;
    updatedAt?: string;
}

type Entity = Course;


const courseSchema = z.object({
    name: z.string().min(3, { message: "O nome do curso deve ter pelo menos 3 caracteres." }),
    acg: z.string().min(1, { message: "O campo ACG é obrigatório." }),
    schedule: z.string().min(3, { message: "O horário/cronograma é obrigatório." }),
});

type CourseFormData = z.infer<typeof courseSchema>;
type FormData = CourseFormData; 


export default function CourseManagerPage() {
    const [currentList, setCurrentList] = useState<Course[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editingEntity, setEditingEntity] = useState<Course | null>(null);

    const { schema, defaultValues } = useMemo(() => {
        return { 
            schema: courseSchema, 
            defaultValues: { name: "", acg: "", schedule: "" } 
        };
    }, []);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm<FormData>({ 
        resolver: zodResolver(schema),
        defaultValues: defaultValues,
    });

    const fetchEntities = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/${ENTITY_TYPE}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                credentials: 'include'
            });
            if (!response.ok) {
                throw new Error(`Erro ao buscar: ${response.statusText}`);
            }
            const data: Course[] = await response.json();
            setCurrentList(data);
        } catch (e: any) {
            setError(`Falha na API: ${e.message}`);
            setCurrentList([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchEntities();
        setEditingEntity(null);
        reset(defaultValues);
    }, [fetchEntities, reset, defaultValues]);


    const handleEdit = (entity: Course) => {
        setEditingEntity(entity);
        reset(entity);
    };

    const handleCreateNew = () => {
        setEditingEntity(null);
        reset(defaultValues);
    };


    const onSubmit = async (data: FormData) => {
        const isEditing = editingEntity && editingEntity.id;
        const method = isEditing ? "PUT" : "POST";
        
        let url = `${API_BASE_URL}/${ENTITY_TYPE}`;
        if (isEditing) {
            url = `${API_BASE_URL}/${ENTITY_TYPE}/${editingEntity.id}`;
        }
        
        const dataToSend = {
            course: {
                name: data.name,
                acg: data.acg,
                schedule: data.schedule,
            }
        };

        try {
            const response = await fetch(url, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dataToSend),
                credentials: 'include'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Erro no servidor: ${errorData.erro || response.statusText}`);
            }

            toast.success(`Curso ${isEditing ? 'atualizado' : 'cadastrado'} com sucesso!`);
            handleCreateNew();
            fetchEntities();
        } catch (e: any) {
            toast.error(`Falha ao salvar: ${e.message}`);
        }
    };


    const handleDelete = async (id: string) => {
        if (!window.confirm(`Tem certeza que deseja excluir este curso?`)) {
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/${ENTITY_TYPE}/${id}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                credentials: 'include'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Erro ao excluir: ${errorData.erro || response.statusText}`);
            }

            toast.success(`Curso excluído com sucesso!`);
            fetchEntities();
        } catch (e: any) {
            toast.error(`Erro ao excluir: ${e.message}`);
        }
    };


    const FormFields = () => {
        return (
            <>
                <div>
                    <label className="block text-sm font-bold text-[var(--blue-50)] mb-1">Nome do Curso</label>
                    <Input 
                        className="w-full border-gray-300" 
                        placeholder="Ex: Ciência da Computação" 
                        {...register("name")} 
                    />
                    {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
                </div>
                
                <div className="flex gap-4">
                    <div className="flex-1">
                        <label className="block text-sm font-bold text-[var(--blue-50)] mb-1">ACG (Atividades)</label>
                        <Input 
                            className="w-full border-gray-300" 
                            placeholder="Ex: 200h" 
                            {...register("acg")} 
                        />
                        {errors.acg && <p className="text-red-500 text-sm">{errors.acg.message}</p>}
                    </div>
                </div>
                
                <div>
                    <label className="block text-sm font-bold text-[var(--blue-50)] mb-1">Horário / Cronograma</label>
                    <textarea 
                        className="w-full border border-gray-300 rounded-lg p-2 min-h-[80px] focus:ring-[var(--blue-100)] focus:border-[var(--blue-100)] transition duration-150" 
                        placeholder="Ex: Segunda à Sexta, 19:00 - 22:30" 
                        {...register("schedule")} 
                    />
                    {errors.schedule && <p className="text-red-500 text-sm">{errors.schedule.message}</p>}
                </div>
            </>
        );
    };


    const TableContent = () => {
        return (
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ACG</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Horário</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Criado Em</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {currentList.map((course) => (
                        <tr key={course.id} className={`hover:bg-gray-100 ${editingEntity?.id === course.id ? "bg-yellow-100" : "bg-white"}`}>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{course.name}</td>
                            <td className="px-4 py-3 text-sm text-gray-500">{course.acg}</td>
                            <td className="px-4 py-3 text-sm text-gray-500">{course.schedule}</td>
                            <td className="px-4 py-3 text-sm text-gray-500">
                                {course.createdAt ? new Date(course.createdAt).toLocaleDateString('pt-BR') : 'N/A'}
                            </td>
                            <td className="px-3 py-3 text-center text-sm font-medium">
                                <button onClick={() => handleEdit(course)} className="text-indigo-600 hover:text-indigo-900 mr-3" disabled={isSubmitting}><Edit fontSize="small"/></button>
                                <button onClick={() => handleDelete(course.id!)} className="text-red-600 hover:text-red-900" disabled={isSubmitting}><Delete fontSize="small"/></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    };


    if (isLoading && currentList.length === 0) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p className="text-xl text-gray-600">Carregando dados...</p>
            </div>
        );
    }

    return (
        <div className="flex gap-8 w-full p-8">
            <aside className="w-1/3 flex flex-col gap-6">
                <header className="flex flex-col w-full rounded-lg bg-[var(--foreground)] p-6 shadow-md border-t-4 border-[var(--blue-100)]">
                    <p className="text-2xl font-bold text-[var(--blue-50)] mb-2">
                        Gerenciador de Cursos
                    </p>
                    <p className="text-sm text-gray-500">
                        {editingEntity ? "Editando Curso: " + editingEntity.name : "Cadastrando Novo Curso"}
                    </p>
                </header>

                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 p-6 bg-[var(--foreground)] rounded-lg shadow-md">
                    <FormFields />

                    <hr className="border-[var(--separator)] my-2" />
                    
                    <div className="flex gap-2 mt-2">
                        {editingEntity && (
                            <button
                                type="button"
                                onClick={handleCreateNew}
                                disabled={isSubmitting}
                                className="flex-1 h-12 cursor-pointer rounded-lg bg-gray-500 text-white font-semibold hover:bg-gray-600 transition flex items-center justify-center gap-2 shadow-md"
                            >
                                <Cancel /> Cancelar
                            </button>
                        )}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`flex-1 h-12 cursor-pointer rounded-lg text-white font-semibold transition flex items-center justify-center gap-2 shadow-md ${
                                editingEntity ? "bg-green-500 hover:bg-green-600" : "bg-[var(--blue-100)] hover:bg-blue-600"
                            }`}
                        >
                            {isSubmitting ? "Salvando..." : editingEntity ? <><Save /> Atualizar</> : <><Add /> Cadastrar</>}
                        </button>
                    </div>
                </form>
                
                <Link href="/admin" className="bg-[var(--foreground)] w-full flex justify-center items-center h-12 rounded-lg hover:bg-gray-100 text-gray-700 font-semibold cursor-pointer duration-300 transition shadow-md">
                    <ArrowBack className="mr-2" /> Voltar para o Admin
                </Link>
            </aside>

            <main className="bg-[var(--foreground)] flex-1 h-full rounded-lg p-6 shadow-md overflow-x-auto">
                <div className="flex justify-between items-center mb-4 border-b pb-4">
                    <h2 className="text-2xl font-bold text-[var(--blue-50)]">Lista de Cursos</h2>
                    <button onClick={fetchEntities} className="text-[var(--blue-100)] hover:text-indigo-900 p-2 rounded-full hover:bg-gray-100 transition" title="Recarregar Lista">
                        <Sync />
                    </button>
                </div>
                
                {error ? (
                    <p className="text-red-700 p-4 border border-red-300 bg-red-100 rounded font-semibold">{error}</p>
                ) : currentList.length === 0 ? (
                    <div className="text-center py-10">
                        <p className="text-xl text-gray-500">Nenhum curso cadastrado.</p>
                        <p className="text-gray-400 mt-2">Use o formulário ao lado para começar.</p>
                    </div>
                ) : (
                    <TableContent />
                )}
            </main>
        </div>
    );
}