'use client'

import { Avatar, IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { validadeImage } from "@/utils/validade_image";
import { error } from "console";

interface UserCardProps {
  name: string;
  personCode: string;
  course?: string;
  role: string;
  editUrl?: string;
  onEdit?: () => void; 
  imageUrl?: string
}

export function UserCard({ name, personCode, course, imageUrl, role, editUrl, onEdit }: UserCardProps) {
  const [avatarImage, setAvatarImage] = useState("");
  const router = useRouter();

  function handleEdit() {
    if (onEdit) {
      onEdit(); 
    } else if (editUrl) {
      router.push(editUrl);
    }
  }

  async function verifyImageUrl() {
    if(imageUrl) {
      try {
        const response = await validadeImage("/avatar.png", imageUrl);
        setAvatarImage(response);
      } catch (error) {
        console.error(error)
      }
    }
  }

  useEffect(() => {
    verifyImageUrl();
  }, [avatarImage])
  
  return (
    <div className="relative min-w-[300px] flex items-center justify-between bg-[var(--foreground)] p-6 rounded-lg shadow-sm">
      {/* Dados do usuário */}
      <div className="flex items-center gap-4">
        <Avatar alt={name} src={avatarImage} sx={{ width: 56, height: 56 }} />
        <div className="flex flex-col">
          <span className="text-lg font-bold text-black">{name}</span>
          <span className="text-sm text-gray-600">{role}</span>
          <div className="mt-2">
            <span className="block text-sm text-gray-500">{personCode}</span>
            {course && (
              <span className="block text-sm text-gray-500">{course}</span>
            )}
          </div>
        </div>
      </div>

      {/* Botão de editar */}
      {(editUrl || onEdit) && (
        <IconButton
          onClick={handleEdit}
          className="absolute top-2 right-2 text-[var(--blue-50)] hover:text-blue-700"
          aria-label="Editar usuário"
        >
          <EditIcon />
        </IconButton>
      )}
    </div>
  );
}
