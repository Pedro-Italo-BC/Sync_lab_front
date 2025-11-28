"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import * as z from "zod";
import { Add, ArrowBack, Cancel, Delete, Edit, Save, Sync } from "@mui/icons-material";
import { api_url } from "@/utils/fetch-url";
import toast from "react-hot-toast";
import Cookies from "js-cookie";

const API_BASE_URL = `${api_url}/api`;

// ----------------------
// Tipo e Schema Zod
// ----------------------
export interface Building {
  id?: string;
  buildCode: string;
  floor: number;
  campus: string;
}

const buildingSchema = z.object({
  buildCode: z.string().min(2, "O código do prédio é obrigatório"),
  floor: z.number().nonnegative("O andar deve ser positivo ou zero"),
  campus: z.string().min(2, "O nome do campus é obrigatório"),
});

type BuildingFormData = z.infer<typeof buildingSchema>;

// ----------------------
// Página principal
// ----------------------
export default function BuildingManagerPage() {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [editing, setEditing] = useState<Building | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BuildingFormData>({
    resolver: zodResolver(buildingSchema),
    defaultValues: { buildCode: "", floor: 0, campus: "" },
  });

  // ----------------------
  // Fetch de prédios
  // ----------------------
  const fetchBuildings = useCallback(async () => {
    setLoading(true);
    setError(null);

    const c = Cookies.get('access_token')
    
    try {
      const res = await fetch(`${API_BASE_URL}/building`, {
        method: "GET",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${c}` },
        credentials: "include",
      });
      if (!res.ok) throw new Error("Erro ao buscar prédios");
      const data = (await res.json()) as Building[];
      setBuildings(data);
    } catch (e: any) {
      console.error(e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBuildings();
  }, [fetchBuildings]);

  // ----------------------
  // Criar/editar prédio
  // ----------------------
  const onSubmit = async (data: BuildingFormData) => {
    const isEditing = !!editing;
    const method = isEditing ? "PUT" : "POST";
    const url = isEditing
      ? `${API_BASE_URL}/building/${editing?.id}`
      : `${API_BASE_URL}/building`;
    const c = Cookies.get('access_token')

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${c}` },
        credentials: "include",
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg);
      }

      toast.success(isEditing ? "Prédio atualizado com sucesso!" : "Prédio criado com sucesso!");
      reset({ buildCode: "", floor: 0, campus: "" });
      setEditing(null);
      fetchBuildings();
    } catch (e: any) {
      toast.error("Erro: " + e.message);
    }
  };


  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este prédio?")) return;
    const c = Cookies.get('access_token')

    try {
      const res = await fetch(`${API_BASE_URL}/building/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${c}` },
        credentials: "include",
      });
      if (!res.ok) throw new Error("Erro ao excluir");
      toast.success("Prédio removido com sucesso!");
      fetchBuildings();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleEdit = (b: Building) => {
    setEditing(b);
    reset(b);
  };

  const handleCancel = () => {
    setEditing(null);
    reset({ buildCode: "", floor: 0, campus: "" });
  };

  // ----------------------
  // UI
  // ----------------------
  return (
    <div className="flex gap-8 w-full p-8">
      {/* Sidebar */}
      <aside className="w-1/3 flex flex-col gap-6">
        <header className="flex flex-col w-full rounded-lg bg-[var(--foreground)] p-6 shadow-md border-t-4 border-[var(--blue-100)]">
          <p className="text-2xl font-bold text-[var(--blue-50)] mb-2">Gerenciar Prédios</p>
          <p className="text-sm text-gray-500 mb-4">
            {editing ? "Editando prédio existente" : "Cadastrando novo prédio"}
          </p>
        </header>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4 p-6 bg-[var(--foreground)] rounded-lg shadow-md"
        >
          <div>
            <label className="block text-sm font-bold text-[var(--blue-50)] mb-1">
              Código do Prédio
            </label>
            <input
              {...register("buildCode")}
              className="w-full border border-gray-300 rounded-lg p-2"
              placeholder="Ex: BL-A"
            />
            {errors.buildCode && <p className="text-red-500 text-sm">{errors.buildCode.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-bold text-[var(--blue-50)] mb-1">Andar</label>
            <input
              type="number"
              {...register("floor", { valueAsNumber: true })}
              className="w-full border border-gray-300 rounded-lg p-2"
              placeholder="Ex: 3"
            />
            {errors.floor && <p className="text-red-500 text-sm">{errors.floor.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-bold text-[var(--blue-50)] mb-1">Campus</label>
            <input
              {...register("campus")}
              className="w-full border border-gray-300 rounded-lg p-2"
              placeholder="Ex: Campus Central"
            />
            {errors.campus && <p className="text-red-500 text-sm">{errors.campus.message}</p>}
          </div>

          <div className="flex gap-2 mt-2">
            {editing ? (
              <>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 h-12 text-white bg-gray-500 hover:bg-gray-600 rounded-lg font-semibold flex items-center justify-center gap-2"
                >
                  <Cancel fontSize="small" /> Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 h-12 text-white bg-green-500 hover:bg-green-600 rounded-lg font-semibold flex items-center justify-center gap-2"
                >
                  <Save fontSize="small" /> Atualizar
                </button>
              </>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 h-12 text-white bg-[var(--blue-100)] hover:bg-blue-600 rounded-lg font-semibold flex items-center justify-center gap-2"
              >
                <Add fontSize="small" /> Cadastrar
              </button>
            )}
          </div>
        </form>

        <Link
          href="/admin"
          className="bg-[var(--foreground)] w-full flex justify-center items-center h-12 rounded-lg hover:bg-gray-100 text-gray-700 font-semibold cursor-pointer duration-300 transition shadow-md"
        >
          <ArrowBack className="mr-2" /> Voltar para o Admin
        </Link>
      </aside>

      {/* Tabela principal */}
      <main className="bg-[var(--foreground)] flex-1 h-full rounded-lg p-6 shadow-md overflow-x-auto">
        <div className="flex justify-between items-center mb-4 border-b pb-4">
          <h2 className="text-2xl font-bold text-[var(--blue-50)]">Lista de Prédios</h2>
          <button
            onClick={fetchBuildings}
            className="text-[var(--blue-100)] hover:text-indigo-900 p-2 rounded-full hover:bg-gray-100 transition"
            title="Recarregar Lista"
          >
            <Sync />
          </button>
        </div>

        {loading && <p className="text-gray-500">Carregando prédios...</p>}
        {error && (
          <p className="text-red-600 bg-red-100 border border-red-300 rounded-md p-2">{error}</p>
        )}

        {!loading && !error && buildings.length === 0 && (
          <p className="text-gray-500">Nenhum prédio cadastrado ainda.</p>
        )}

        {!loading && buildings.length > 0 && (
          <table className="min-w-full divide-y divide-gray-200 mt-2">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Código
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Andar
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Campus
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {buildings.map((b) => (
                <tr
                  key={b.id}
                  className={`hover:bg-gray-100 ${
                    editing?.id === b.id ? "bg-yellow-100" : "bg-white"
                  }`}
                >
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{b.buildCode}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{b.floor}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{b.campus}</td>
                  <td className="px-4 py-3 text-center text-sm font-medium flex justify-center gap-3">
                    <button
                      onClick={() => handleEdit(b)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <Edit fontSize="small" />
                    </button>
                    <button
                      onClick={() => handleDelete(b.id!)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Delete fontSize="small" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </div>
  );
}