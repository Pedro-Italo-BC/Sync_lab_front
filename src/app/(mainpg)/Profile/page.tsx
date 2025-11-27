"use client"

import { useState } from "react"
import toast from "react-hot-toast"

interface UserProps {
   name: string,
    email: string,
    course: string,
    role: string,
    image: string,
}

export default function ProfilePage() {
  // Mock de dados do usuário
  const [user, setUser] = useState<UserProps>({} as UserProps)

  // Manipulador de mudanças (simulação)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setUser({ ...user, [name]: value })
  }

  // Simula o “salvar”
  const handleSave = () => {
    toast.success("Alterações salvas com sucesso!")
  }

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center p-6">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          Configurações da Conta
        </h1>

        {/* FOTO DE PERFIL */}
        <div className="flex flex-col items-center mb-6">
          <img
            src={user.image}
            alt="Foto de perfil"
            className="w-24 h-24 rounded-full object-cover border-2 border-gray-300"
          />
          <button className="mt-3 px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded-lg transition">
            Alterar foto
          </button>
        </div>

        {/* CAMPOS DE EDIÇÃO */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome completo
            </label>
            <input
              name="name"
              value={user.name}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              E-mail
            </label>
            <input
              name="email"
              value={user.email}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Curso
            </label>
            <input
              name="course"
              value={user.course}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cargo
            </label>
            <input
              name="role"
              value={user.role}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* BOTÕES */}
        <div className="flex justify-end gap-4 mt-8">
          <button
            onClick={() => window.history.back()}
            className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
          >
            Salvar alterações
          </button>
        </div>
      </div>
    </div>
  )
}
