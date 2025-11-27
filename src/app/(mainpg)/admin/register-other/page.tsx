"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
const Input = (props: any) => <input {...props} />; 

import { ArrowBack, Edit, Delete, Add, Save, Cancel, Sync, Image } from "@mui/icons-material";
import { api_url } from "@/utils/fetch-url";
import { uploadImage } from "@/utils/uploadImage";
import toast from "react-hot-toast";

const API_BASE_URL = `${api_url}/api`;

interface Equipment {
  id?: string;
  name: string;
  description?: string;
  quantity: number;
  status: string;
  maxLoanDuration?: number;
  imageUrl?: string;
}

interface Room {
  id?: string;
  roomCode: string;
  capacity: number;
  roomType: string;
  code: string;
  status: string;
  imageUrl?: string;
  buildingId: string;
  floor: number;
}

type Entity = Equipment | Room;
type EntityType = 'equipment' | 'room';


const EQUIPMENT_STATUS_OPTIONS = ["Available", "In Use", "Maintenance"] as const;
const ROOM_STATUS_OPTIONS = ["FREE", "BUSY", "MAINTENANCE"] as const;
const ROOM_TYPE_OPTIONS = ["LAB", "CLASSROOM", "MEETING_ROOM", "OFFICE", "AUDITORIUM", "OTHER"] as const;

const equipmentSchema = z.object({
  name: z.string().min(3, { message: "O nome deve ter pelo menos 3 caracteres." }),
  quantity: z.number().min(1, { message: "A quantidade deve ser de pelo menos 1." }),
  status: z.enum(EQUIPMENT_STATUS_OPTIONS, { message: "Status de equipamento inválido." }),
  description: z.string().optional(),
  maxLoanDuration: z.number().optional(),
  imageUrl: z.string().optional(),
});

const roomSchema = z.object({
  roomCode: z.string().min(2, { message: "O código da sala deve ter pelo menos 2 caracteres." }),
  capacity: z.number().min(1, { message: "A capacidade deve ser de pelo menos 1." }),

  roomType: z.enum(ROOM_TYPE_OPTIONS, { message: "O tipo de sala é obrigatório." }),
  code: z.string().min(2, { message: "O código é obrigatório." }),

  status: z.enum(ROOM_STATUS_OPTIONS, { message: "Status de sala inválido." }),
  imageUrl: z.string().optional(),
  buildingId: z.string().uuid({ message: "ID de Prédio inválido (UUID obrigatório)." }),
  floor: z.number().min(0, { message: "O andar não pode ser negativo." }),
});

type EquipmentFormData = z.infer<typeof equipmentSchema>;
type RoomFormData = z.infer<typeof roomSchema>;
type FormData = EquipmentFormData | RoomFormData; 

export default function UnifiedEntityManagerPage() {
  const [entityType, setEntityType] = useState<EntityType>('equipment');
  const [currentList, setCurrentList] = useState<Entity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingEntity, setEditingEntity] = useState<Entity | null>(null);
  const [imageUrlFile, setImageUrlFile] = useState<File | null>(null); 
  const [localImageUrl, setLocalImageUrl] = useState<string | null>(null); 
  const [buildings, setBuildings] = useState<{ id: string; buildCode: string; campus: string; floor: number }[]>([]);

  const { schema, defaultValues } = useMemo(() => {
    if (entityType === 'equipment') {
      return { 
        schema: equipmentSchema, 
        defaultValues: { name: "", quantity: 1, status: EQUIPMENT_STATUS_OPTIONS[0], description: "", maxLoanDuration: 7, imageUrl: "" } 
      };
    } else {
      return { 
        schema: roomSchema, 
        defaultValues: { roomCode: "", capacity: 1, roomType: ROOM_TYPE_OPTIONS[0], code: "", status: ROOM_STATUS_OPTIONS[0], imageUrl: "", buildingId: "", floor: 0 } 
      };
    }
  }, [entityType]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    getValues,
    watch
  } = useForm<any>({ 
    resolver: zodResolver(schema),
    defaultValues: defaultValues,
  });

  const watchedImageUrl = watch('imageUrl');

  useEffect(() => {
  if (entityType === 'room') {
    fetch(`${API_BASE_URL}/building`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => setBuildings(data))
      .catch(err => console.error("Erro ao carregar prédios:", err));
  }
}, [entityType]);


  useEffect(() => {
    if (imageUrlFile) {
        setLocalImageUrl(URL.createObjectURL(imageUrlFile));
    } else if (watchedImageUrl) {
        setLocalImageUrl(watchedImageUrl);
    } else if (editingEntity && editingEntity.imageUrl) {
        setLocalImageUrl(editingEntity.imageUrl);
    } else {
        setLocalImageUrl(null);
    }

    return () => {
        if (imageUrlFile) {
            URL.revokeObjectURL(localImageUrl || '');
        }
    };
  }, [imageUrlFile, watchedImageUrl, editingEntity]);


  const fetchEntities = useCallback(async (type: EntityType) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/${type}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error(`Erro ao buscar: ${response.statusText}`);
      }
      const data: Entity[] = await response.json();
      setCurrentList(data);
    } catch (e: any) {
      setError(`Falha na API: ${e.message}`);
      setCurrentList([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEntities(entityType);
    setEditingEntity(null);
    reset(defaultValues);
    setImageUrlFile(null);
  }, [entityType, fetchEntities, reset, defaultValues]);

  const handleEdit = (entity: Entity) => {
    setEditingEntity(entity);
    reset(entity);
    setImageUrlFile(null);
  };

  const handleCreateNew = () => {
    setEditingEntity(null);
    reset(defaultValues);
    setImageUrlFile(null);
  };

  const onSubmit = async (data: any) => { 
    const isEditing = editingEntity && editingEntity.id;
    const method = isEditing ? "PUT" : "POST";
    let finalImageUrl = data.imageUrl || "";

    if (imageUrlFile) {
        try {
            const url = await uploadImage(imageUrlFile)
            finalImageUrl = url; 

        } catch (e: any) {
            toast.error(`Falha ao fazer upload da imagem: ${e.message}`);
            return;
        }
    }

    const url = isEditing ? `${API_BASE_URL}/${entityType}/${editingEntity.id}` : `${API_BASE_URL}/${entityType}`;
    
    const dataToSend = {
      ...data,
      imageUrl: finalImageUrl,
      capacity: entityType === 'room' ? Number(data.capacity) : undefined,
      quantity: entityType === 'equipment' ? Number(data.quantity) : undefined,
      floor: entityType === 'room' ? Number(data.floor) : undefined,
      maxLoanDuration: entityType === 'equipment' && data.maxLoanDuration ? Number(data.maxLoanDuration) : undefined,
    } as Entity;

    if (entityType === 'equipment') {
      ['roomCode', 'capacity', 'roomType', 'code', 'buildingId', 'floor'].forEach(key => delete (dataToSend as any)[key]);
    } else {
      ['name', 'description', 'quantity', 'maxLoanDuration'].forEach(key => delete (dataToSend as any)[key]);
    }

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

      toast.success(`${entityType === 'equipment' ? 'Equipamento' : 'Sala'} ${isEditing ? 'atualizado' : 'criado'} com sucesso!`);
      handleCreateNew();
      fetchEntities(entityType);
    } catch (e: any) {
      toast.error(`Falha ao salvar: ${e.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir este ${entityType}?`)) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/${entityType}/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Erro ao excluir: ${errorData.erro || response.statusText}`);
      }

      toast.success(`${entityType === 'equipment' ? 'Equipamento' : 'Sala'} excluído com sucesso!`);
      fetchEntities(entityType);
    } catch (e: any) {
      toast.error(`Erro ao excluir: ${e.message}`);
    }
  };

  const FormFields = () => {
    if (entityType === 'equipment') {
      return (
        <>
          <div>
            <label className="block text-sm font-bold text-[var(--blue-50)] mb-1">Nome</label>
            <Input className="w-full border-gray-300" placeholder="Nome do equipamento" {...register("name")} />
            {errors.name && <p className="text-red-500 text-sm">{`${errors.name.message}`}</p>}
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-bold text-[var(--blue-50)] mb-1">Quantidade</label>
              <Input className="w-full border-gray-300" placeholder="Ex: 5" type="number" min="1" {...register("quantity", { valueAsNumber: true })} />
              {errors.quantity && <p className="text-red-500 text-sm">{`${errors.quantity.message}`}</p>}
            </div>
            <div className="flex-1">
              <label className="block text-sm font-bold text-[var(--blue-50)] mb-1">Duração Máx. Empréstimo (dias)</label>
              <Input className="w-full border-gray-300" placeholder="Ex: 7" type="number" {...register("maxLoanDuration", { valueAsNumber: true })} />
              {errors.maxLoanDuration && <p className="text-red-500 text-sm">{`${errors.maxLoanDuration.message}`}</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-[var(--blue-50)] mb-1">Status</label>
            <select {...register("status")} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-[var(--blue-100)] focus:border-[var(--blue-100)] transition duration-150">
              {EQUIPMENT_STATUS_OPTIONS.map(status => (
                <option key={status} value={status}>
                  {status === "Available" ? "Disponível" : status === "In Use" ? "Em Uso" : "Em Manutenção"}
                </option>
              ))}
            </select>
            {errors.status && <p className="text-red-500 text-sm">{`${errors.status.message}`}</p>}
          </div>
        </>
      );
    } else { 
      return (
        <>
          <div className="flex gap-4">
            <div className="flex-1">
                <label className="block text-sm font-bold text-[var(--blue-50)] mb-1">Código Sala</label>
                <Input className="w-full border-gray-300" placeholder="Ex: SALA101" {...register("roomCode")} />
                {errors.roomCode && <p className="text-red-500 text-sm">{`${errors.roomCode.message}`}</p>}
            </div>
            <div className="flex-1">
                <label className="block text-sm font-bold text-[var(--blue-50)] mb-1">Código Interno</label>
                <Input className="w-full border-gray-300" placeholder="Ex: BLA-101" {...register("code")} />
                {errors.code && <p className="text-red-500 text-sm">{`${errors.code.message}`}</p>}
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
                <label className="block text-sm font-bold text-[var(--blue-50)] mb-1">Tipo de Sala</label>
                <select {...register("roomType")} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-[var(--blue-100)] focus:border-[var(--blue-100)] transition duration-150">
                    {ROOM_TYPE_OPTIONS.map(type => (
                        <option key={type} value={type}>
                            {type.replace(/_/g, ' ').toUpperCase()}
                        </option>
                    ))}
                </select>
                {errors.roomType && <p className="text-red-500 text-sm">{`${errors.roomType.message}`}</p>}
            </div>
            <div className="flex-1">
                <label className="block text-sm font-bold text-[var(--blue-50)] mb-1">Capacidade</label>
                <Input className="w-full border-gray-300" placeholder="Ex: 40" type="number" min="1" {...register("capacity", { valueAsNumber: true })} />
                {errors.capacity && <p className="text-red-500 text-sm">{`${errors.capacity.message}`}</p>}
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
                <label className="block text-sm font-bold text-[var(--blue-50)] mb-1">Andar</label>
                <Input className="w-full border-gray-300" placeholder="Ex: 1" type="number" {...register("floor", { valueAsNumber: true })} />
                {errors.floor && <p className="text-red-500 text-sm">{`${errors.floor.message}`}</p>}
            </div>
            <div className="flex-1">
                <label className="block text-sm font-bold text-[var(--blue-50)] mb-1">Status</label>
                <select {...register("status")} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-[var(--blue-100)] focus:border-[var(--blue-100)] transition duration-150">
                    {ROOM_STATUS_OPTIONS.map(status => (
                        <option key={status} value={status}>
                            {status === "FREE" ? "Livre" : status === "BUSY" ? "Ocupada" : "Manutenção"}
                        </option>
                    ))}
                </select>
                {errors.status && <p className="text-red-500 text-sm">{`${errors.status.message}`}</p>}
            </div>
          </div>
         <div>
        <label className="block text-sm font-bold text-[var(--blue-50)] mb-1">Prédio</label>
        <select
          {...register("buildingId")}
          className="w-full border border-gray-300 rounded-lg p-2 focus:ring-[var(--blue-100)] focus:border-[var(--blue-100)] transition duration-150"
        >
          <option value="">Selecione um prédio</option>
          {buildings.map((b) => (
            <option key={b.id} value={b.id}>
              {b.buildCode} — {b.campus} (Andar: {b.floor})
            </option>
          ))}
        </select>
        {errors.buildingId && <p className="text-red-500 text-sm">{`${errors.buildingId.message}`}</p>}
      </div>
        </>
      );
    }
  };

  const TableContent = () => {
    if (entityType === 'equipment') {
      return (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qtd</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Emprést. Máx. (dias)</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentList.map((entity) => {
              const equipment = entity as Equipment;
              return (
                <tr key={equipment.id} className={`hover:bg-gray-100 ${editingEntity?.id === equipment.id ? "bg-yellow-100" : "bg-white"}`}>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{equipment.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{equipment.quantity}</td>
                
                  <td className="px-4 py-3 text-sm text-gray-500">{equipment.maxLoanDuration || 'N/A'}</td>
                  <td className="px-4 py-3 text-center text-sm font-medium">
                    <button onClick={() => handleEdit(equipment)} className="text-indigo-600 hover:text-indigo-900 mr-3" disabled={isSubmitting}><Edit fontSize="small"/></button>
                    <button onClick={() => handleDelete(equipment.id!)} className="text-red-600 hover:text-red-900" disabled={isSubmitting}><Delete fontSize="small"/></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      );
    } else {
      return (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código Sala</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capac.</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Andar</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentList.map((entity) => {
              const room = entity as Room;
              return (
                <tr key={room.id} className={`hover:bg-gray-100 ${editingEntity?.id === room.id ? "bg-yellow-100" : "bg-white"}`}>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{room.code}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{room.roomType}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{room.capacity}</td>
                 
                  <td className="px-4 py-3 text-sm text-gray-500">{room.floor}</td>
                  <td className="px-4 py-3 text-center text-sm font-medium">
                    <button onClick={() => handleEdit(room)} className="text-indigo-600 hover:text-indigo-900 mr-3" disabled={isSubmitting}><Edit fontSize="small"/></button>
                    <button onClick={() => handleDelete(room.id!)} className="text-red-600 hover:text-red-900" disabled={isSubmitting}><Delete fontSize="small"/></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      );
    }
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
            Gerenciador Unificado
          </p>
          <p className="text-sm text-gray-500 mb-4">
            {editingEntity ? "Editando" : "Criando"} **{entityType === 'equipment' ? "Equipamento" : "Sala"}**
          </p>

          <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
            <button
              type="button"
              onClick={() => setEntityType('equipment')}
              disabled={isSubmitting}
              className={`flex-1 h-10 font-semibold rounded-md transition duration-200 ${
                entityType === 'equipment' ? "bg-[var(--blue-100)] text-white shadow-md" : "text-gray-600 hover:bg-gray-200"
              }`}
            >
              Equipamento
            </button>
            <button
              type="button"
              onClick={() => setEntityType('room')}
              disabled={isSubmitting}
              className={`flex-1 h-10 font-semibold rounded-md transition duration-200 ${
                entityType === 'room' ? "bg-[var(--blue-100)] text-white shadow-md" : "text-gray-600 hover:bg-gray-200"
              }`}
            >
              Sala
            </button>
          </div>
        </header>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 p-6 bg-[var(--foreground)] rounded-lg shadow-md">
          <FormFields />

          <hr className="border-[var(--separator)] my-2" />
          
          {entityType === 'equipment' && (
            <div>
                <label className="block text-sm font-bold text-[var(--blue-50)] mb-1">Descrição</label>
                <textarea className="w-full border border-gray-300 rounded-lg p-2 min-h-[80px] focus:ring-[var(--blue-100)] focus:border-[var(--blue-100)] transition duration-150" placeholder="Breve descrição do equipamento" {...register("description")} />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-bold text-[var(--blue-50)] mb-1">URL da Imagem ou Upload Local</label>
            <div className="flex gap-2">
                <Input 
                    className="w-full border-gray-300" 
                    placeholder="Cole um URL externo (http://...)" 
                    {...register("imageUrl")} 
                    disabled={!!imageUrlFile || isSubmitting}
                />
                
                <label className={`w-36 h-10 flex items-center justify-center border rounded-lg cursor-pointer text-sm font-semibold transition ${
                    imageUrlFile ? 'bg-green-500 text-white border-green-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}>
                    {imageUrlFile ? 'Arquivo Selecionado' : 'Upload Local'}
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            setImageUrlFile(file);
                            if(file) reset({ ...getValues(), imageUrl: "" }); 
                        }}
                        className="hidden"
                        disabled={isSubmitting}
                    />
                </label>
            </div>

            {imageUrlFile && (
                <p className="text-sm text-gray-600 mt-1 flex justify-between items-center bg-gray-50 p-2 rounded">
                    <span>Arquivo: **{imageUrlFile.name}**</span>
                    <button type="button" onClick={() => setImageUrlFile(null)} className="ml-2 text-red-500 hover:text-red-700 text-xs font-bold">
                        (Remover)
                    </button>
                </p>
            )}

          </div>

          {localImageUrl && (
            <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50 flex flex-col items-center">
                <label className="block text-sm font-bold text-[var(--blue-50)] mb-2">Pré-visualização</label>
                <div className="w-full h-40 flex items-center justify-center bg-gray-200 rounded-md overflow-hidden">
                    <img 
                        src={localImageUrl} 
                        alt="Pré-visualização da Imagem" 
                        className="max-w-full max-h-full object-contain"
                        onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.parentElement!.innerHTML = '<div class="flex flex-col items-center justify-center h-full text-gray-500"><svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m0 0l-3-3m3 3l3-3m5 3l-3 3m3-3l-3 3m5-3v6m0-6l-3-3m3 3l3-3"></path></svg><p class="mt-2 text-sm">Não foi possível carregar a imagem ou a URL está inválida.</p></div>';
                        }}
                    />
                </div>
            </div>
          )}

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
            <h2 className="text-2xl font-bold text-[var(--blue-50)]">Lista de {entityType === 'equipment' ? 'Equipamentos' : 'Salas'}</h2>
            <button onClick={() => fetchEntities(entityType)} className="text-[var(--blue-100)] hover:text-indigo-900 p-2 rounded-full hover:bg-gray-100 transition" title="Recarregar Lista">
                <Sync />
            </button>
        </div>
        
        {error ? (
            <p className="text-red-700 p-4 border border-red-300 bg-red-100 rounded font-semibold">{error}</p>
        ) : currentList.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-xl text-gray-500">Nenhum(a) {entityType} cadastrado(a).</p>
            <p className="text-gray-400 mt-2">Use o formulário ao lado para começar.</p>
          </div>
        ) : (
          <TableContent />
        )}
      </main>
    </div>
  );
}