"use client";

import { UserCard } from "@/components/UserCard/UserCard";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowBack } from "@mui/icons-material";
import { api_url } from "@/utils/fetch-url";
import noImage from '../../../../../public/user-img.png'
import {
  Dialog,
  Box,
  Typography,
  IconButton,
  TextField,
  Slide,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

type FilterForm = {
  role?: string;
  course?: string;
  search?: string;
};

type ApiUser = {
  id: string;
  name: string;
  phoneNumber: string;
  cpf: string;
  birthDate: Date;
  profileUrl: string;
  description: string;
  personCode: string;
  createdAt: string;
  updatedAt: string;
  role: "ADMIN" | "PROFESSOR" | "STUDENT";
  course?: string;
};

type User = {
  id: string;
  name: string;
  role: string;
  personCode: string;
  phoneNumber: string;
  cpf: string;
  birthDate: Date;
  description?: string;
  course?: string;
  matricula?: string;
  profileUrl?: string;
};

const RoleMap: Record<ApiUser["role"], string> = {
  ADMIN: "Administrador",
  PROFESSOR: "Professor",
  STUDENT: "Aluno",
};

export default function UsersPage() {
  const { register, handleSubmit } = useForm<FilterForm>();
  const [filters, setFilters] = useState<FilterForm>({});
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [courses, setCourses] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [editForm, setEditForm] = useState<User | null>(null);
  const [editImage, setEditImage] = useState<File | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(`${api_url}/api/person`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        if (!res.ok) throw new Error("Erro ao buscar usuários");
        const data: ApiUser[] = await res.json();

        const mapped = data.map((user) => ({
          id: user.id,
          name: user.name,
          personCode: user.personCode,
          role: RoleMap[user.role],
          phoneNumber: user.phoneNumber,
          cpf: user.cpf,
          birthDate: new Date(user.birthDate),
          description: user.description,
          matricula: user.personCode,
          profileUrl: user.profileUrl,
          course: user.course || (
            user.role === "STUDENT" ? "Ciência da Computação" :
            user.role === "PROFESSOR" ? "Administração" :
            "Economia"
          ),
        }));

        setUsers(mapped);
        const uniqueRoles = Array.from(new Set(mapped.map((user) => user.role)));
        const uniqueCourses = Array.from(
          new Set(mapped.map((user) => user.course).filter(Boolean))
        );
        setRoles(["", ...uniqueRoles]);
        setCourses(["", ...uniqueCourses]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  function onSubmit(data: FilterForm) {
    setFilters(data);
  }

  const handleSave = async () => {
    if (!editForm) return;
    try {
      let urlResponse = editForm.profileUrl || "";
        
      if(editImage) {
        const formData = new FormData();
        formData.append("image", editImage);

        const imageResponse = await fetch(`${api_url}/api/upload`, {
          method: 'POST',
          credentials: "include",
          body: formData
        })

        if (!imageResponse.ok) {
          throw new Error("Falha ao fazer upload da imagem.");
        }
        
        const responseBody = await imageResponse.json();
        urlResponse = responseBody.url; 
      }

      const updatedEditForm = { ...editForm, profileUrl: urlResponse };

      await fetch(`${api_url}/api/person/${selectedUser?.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedEditForm),
        credentials: "include"
      });
      
      setUsers((prev) =>
        prev.map((u) => (u.id === updatedEditForm.id ? { ...updatedEditForm } : u))
      );
      setSelectedUser(null);
      setEditForm(null);
      setEditImage(null);
    } catch (e) {
      console.error("Erro ao salvar usuário:", e);
    }
  };

  const handleDelete = async () => {
    if(selectedUser != null && confirm(`Você realmente deseja deletar o(a) usuário(a) ${selectedUser.name}`)) {
      try {
        await fetch(`${api_url}/api/person/${selectedUser.id}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
      setUsers((prev) =>
        prev.filter((u) => (u.id !== selectedUser.id)  
      ));
      setSelectedUser(null);
      setEditForm(null);
      setEditImage(null);
      } catch(e) {
        console.error(e);
      }     
    }    
  }

  const filteredUsers = users.filter((user) => {
    const matchesRole = filters.role ? user.role === filters.role : true;
    const matchesCourse = filters.course ? user.course === filters.course : true;
    const matchesName = filters.search
      ? user.name.toLowerCase().includes(filters.search.toLowerCase())
      : true;
    return matchesRole && matchesCourse && matchesName;
  });

  const grouped = {
    Administrador: filteredUsers.filter((user) => user.role === "Administrador"),
    Professor: filteredUsers.filter((user) => user.role === "Professor"),
    Aluno: filteredUsers.filter((user) => user.role === "Aluno"),
  };

  const handleCloseDialog = () => {
    setSelectedUser(null);
    setEditForm(null);
    setEditImage(null);
  };

  const getImageUrl = () => {
    if (editImage) {
      return URL.createObjectURL(editImage);
    }
    if (selectedUser?.profileUrl) {
      return selectedUser.profileUrl;
    }
    return noImage.src;
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

      <main className="bg-[var(--foreground)] flex-1 h-full rounded-lg p-8 flex flex-col">
        <h1 className="text-2xl font-bold text-black mb-6">Gerenciar Usuários</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="flex gap-4 mb-4">
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel id="role-select-label">Função</InputLabel>
            <Select
              labelId="role-select-label"
              id="role-select"
              label="Função"
              defaultValue=""
              {...register("role")}
            >
              {roles.map((role) => (
                <MenuItem key={role} value={role}>
                  {role || "Todas as Funções"}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Buscar por nome"
            variant="outlined"
            {...register("search")}
            sx={{ flex: 1 }}
          />
          <Button type="submit" variant="contained" color="primary" sx={{ textTransform: "none" }}>
            Aplicar Filtros
          </Button>
        </form>

        <div className="flex-1 overflow-y-auto mt-6 pr-2">
          {loading ? (
            <p className="text-gray-500">Carregando usuários...</p>
          ) : (
            <div className="flex flex-col gap-6">
              {Object.entries(grouped).map(([role, users]) =>
                users.length > 0 ? (
                  <section key={role}>
                    <h2 className="text-xl font-semibold text-black mb-2">{role}s</h2>
                    <div className="flex flex-wrap gap-4">
                      {users.map((user) => (
                        <UserCard
                          key={user.id}
                          name={user.name}
                          personCode={user.personCode || ""}
                          role={user.role}
                          imageUrl={user.profileUrl}
                          onEdit={() => {
                            setSelectedUser(user);
                            setEditForm(user);
                            setEditImage(null); 
                          }}
                        />
                      ))}
                    </div>
                  </section>
                ) : null
              )}
            </div>
          )}
        </div>
      </main>

      <Dialog
        open={!!selectedUser}
        onClose={handleCloseDialog}
        TransitionComponent={Slide}
        keepMounted
        sx={{
          "& .MuiBackdrop-root": {
            backgroundColor: "rgba(0, 0, 0, 0.7)",
          },
        }}
        PaperProps={{
          sx: {
            maxWidth: 600,
            width: "100%",
            margin: "auto",
            borderRadius: 4,
            backgroundColor: "#fff",
            color: "#000",
            p: 4,
          },
        }}
      >
        {editForm && (
          <Box display="flex" flexDirection="column" gap={3}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6">Editar Usuário</Typography>
              <IconButton onClick={handleCloseDialog}>
                <CloseIcon />
              </IconButton>
            </Box>

            <label htmlFor="editUserImage" style={{ cursor: 'pointer' }}>
              <p className="font-semibold text-[#333] mb-2">Modificar foto do usuário</p>
              <img
                src={getImageUrl()}
                width={80}
                height={80}
                alt="Foto do usuário"
                className="w-20 h-20 hover:brightness-90 transition duration-300 rounded-lg object-cover"
              />

              <input
                className="invisible absolute"
                type="file"
                accept="image/*"
                id="editUserImage"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null
                  setEditImage(file);
                }}
              />
            </label>

            <TextField
              label="Nome"
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              fullWidth
            />
            <TextField
              label="Código de pessoa"
              value={editForm.personCode}
              onChange={(e) => setEditForm({ ...editForm, personCode: e.target.value })}
              fullWidth
            />
            <TextField
              label="Matrícula"
              value={editForm.matricula}
              onChange={(e) => setEditForm({ ...editForm, matricula: e.target.value })}
              fullWidth
            />
            <TextField
              label="Descrição"
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              multiline
              rows={3}
              fullWidth
            />
            <Box display="flex" justifyContent="flex-end" gap={2}>
              <Button
                variant="contained"
                color="error"
                onClick={handleDelete}
                sx={{ textTransform: "none" }}
              >
                Excluir Usuário
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSave}
                sx={{ textTransform: "none" }}
              >
                Salvar Alterações
              </Button>
            </Box>
          </Box>
        )}
      </Dialog>
    </div>
  );
}