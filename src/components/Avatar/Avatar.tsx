'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Person from "@mui/icons-material/Person";
import { api_url } from "@/utils/fetch-url";
import jwtUtils from "@/utils/jwt-utils";
import toast from "react-hot-toast";

const API_BASE_URL = `${api_url}/api`; 
const LOGOUT_URL = `${api_url}/auth/logout`; 
const PERSON_URL = `${API_BASE_URL}/person`; 
const DEFAULT_IMAGE = "https://via.placeholder.com/100"; 

type PersonData = {
    id: string;
    name: string;
    phoneNumber: string;
    cpf: string;
    birthDate: string;
    profileUrl: string;
    description: string;
    personCode: string;
    role: 'ADMIN' | 'PROFESSOR' | 'STUDENT' | string;
};

type UserState = { 
    name: string; 
    email: string; 
    image: string; 
} | null;

type AvatarProps = {
    src?: string
};

export function Avatar({ src }: AvatarProps) {
    const [open, setOpen] = useState(false);
    const [user, setUser] = useState<UserState>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [userId, setUserId] = useState('')
    const router = useRouter();

    useEffect(() => {
        while(!userId){
            setUserId(JSON.stringify(jwtUtils.getSub() ? jwtUtils.getSub() : ''))
        }


        async function fetchUserData() {
            try {
                
                const response = await fetch(PERSON_URL +"/" + jwtUtils.getSub(), { 
                            headers: { 'Content-Type': 'application/json' },
                            credentials: 'include'
                });

                
                if (!response.ok) {
                    throw new Error("Falha ao buscar dados da pessoa.");
                }
                const data: PersonData = await response.json();
                console.log("User> ",data)
                
                console.log(data)
                if (data != null) {
                    const loggedInUser = data; 
                    
                    const emailMock = loggedInUser.name.toLowerCase().replace(/\s/g, '.') + "@email.com";
                    
                    const profileImage = (loggedInUser.profileUrl && loggedInUser.profileUrl !== "") 
                        ? loggedInUser.profileUrl 
                        : DEFAULT_IMAGE;

                    setUser({
                        name: loggedInUser.name,
                        email: emailMock,
                        image: profileImage
                    });
                }
            } catch (error) {
                console.error("Erro ao carregar dados do usuário:", error);
                setUser({
                    name: "Usuário Desconectado",
                    email: "erro@email.com",
                    image: DEFAULT_IMAGE
                });
            } finally {
                setIsLoading(false);
            }
        }
        fetchUserData();
    }, [userId]);


    async function handleLogout() {
        setOpen(false);
        try {
            const response = await fetch(LOGOUT_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include'
            });

            if (response.ok) {
                router.push("/login"); 
            } else {
                const errorBody = await response.json().catch(() => ({}));
                const errorMessage = errorBody.erro || `Falha HTTP: ${response.status}`;
                throw new Error(errorMessage);
            }
        } catch (error: any) {
            console.error("Erro durante o logout:", error);
            toast.error(`Falha ao realizar logout: ${error.message}. Tente novamente.`);
        }
    }

    // Função auxiliar para renderizar a imagem ou o ícone padrão
    const renderAvatarImage = (size: 'small' | 'large' = 'small') => {
        const isDefault = user!.image === DEFAULT_IMAGE;
        const widthHeight = size === 'small' ? 'w-10 h-10' : 'w-12 h-12';
        const iconSize = size === 'small' ? 'w-6 h-6' : 'w-7 h-7';

        if (isDefault) {
            // Garante que o ícone está centralizado e tem o tamanho correto DENTRO do círculo
            return (
                <div className={`${widthHeight} flex items-center justify-center rounded-full bg-gray-200`}>
                    <Person className={`${iconSize} text-black`} />
                </div>
            );
        }

        return (
            <img
                src={user!.image}
                alt="Avatar"
                // object-cover garante que a imagem preenche o círculo sem distorção
                className={`${widthHeight} rounded-full object-cover`} 
            />
        );
    };

    if (isLoading) {
        return <div className="rounded-full w-10 h-10 bg-gray-300 animate-pulse"></div>;
    }

    if (!user) {
        return <Person className="w-8 h-8 text-black" />;
    }

    return (
        <div className="relative">
            {/* Botão Avatar */}
            <button
                onClick={() => setOpen(!open)}
                className="rounded-full p-0 bg-[var(--background)] cursor-pointer hover:brightness-90 duration-300 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                {renderAvatarImage('small')}
            </button>

            {/* Dropdown */}
            {open && (
                <div className="absolute right-0 mt-2 w-64 bg-white shadow-xl rounded-lg overflow-hidden border border-gray-100 z-50">
                    <div className="p-4 flex items-center gap-3">
                        {renderAvatarImage('large')}
                        <div>
                            <p className="font-semibold text-gray-900 truncate">{user.name}</p>
                        </div>
                    </div>

                    <div className="border-t border-gray-200">
                        <button
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                            onClick={handleLogout}
                        >
                            Sair
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}