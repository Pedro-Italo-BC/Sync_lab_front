'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Person from "@mui/icons-material/Person";
import { api_url } from "@/utils/fetch-url";
import jwtUtils from "@/utils/jwt-utils";
import toast from "react-hot-toast";
import { validadeImage } from "@/utils/validade_image";
import Cookies from "js-cookie";
import axios from "axios"; // 💡 Importamos o Axios

const API_BASE_URL = `${api_url}/api`;
const LOGOUT_URL = `${api_url}/auth/logout`;
const PERSON_URL = `${API_BASE_URL}/person`;
const DEFAULT_IMAGE = "/avatar.png";

// 💡 Configuração global do Axios
// Isso garante que ele sempre usará a base URL e incluirá cookies em todas as requisições
axios.defaults.baseURL = api_url; // Ajuste para a URL base da API
axios.defaults.withCredentials = true; // ESSENCIAL para enviar cookies

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
};

export function Avatar() {
    const [open, setOpen] = useState(false);
    const [user, setUser] = useState<UserState>({} as UserState) ;
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    async function verifyImage(url: string) {
        const response = await validadeImage(DEFAULT_IMAGE, url);
        setUser(user => {
            return {...user, image: response}
        })
    }

    useEffect(() => {
        async function fetchUserData() {
            const c = Cookies.get('access_token');
            if (!c) {
                setIsLoading(false);
                return;
            }

            try {
                const response = await axios.get(PERSON_URL + "/" + jwtUtils.getSub(), {
                    headers: { 
                        'Content-Type': 'application/json', 
                        "Authorization": `Bearer ${c}` 
                    },
                    withCredentials: true
                });

                const data: PersonData = response.data; 
                console.log("User> ", data)

                if (data != null) {
                    const loggedInUser = data;
                    const emailMock = loggedInUser.name.toLowerCase().replace(/\s/g, '.') + "@email.com";
                    
                    setUser({
                        name: loggedInUser.name,
                        email: emailMock,
                        image: DEFAULT_IMAGE
                    });

                    verifyImage(loggedInUser.profileUrl);
                }
            } catch (error) {
                console.error("Erro ao carregar dados do usuário:", error);
                const errorMessage = axios.isAxiosError(error) && error.response 
                    ? error.response.data.erro || `Falha HTTP: ${error.response.status}`
                    : "Erro desconhecido";
                
                toast.error(`Sessão expirada ou falha ao carregar usuário: ${errorMessage}`); 
                
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
    }, []);


    async function handleLogout() {
        setOpen(false);
        try {
            const response = await axios.post(LOGOUT_URL, null, {
                headers: { 'Content-Type': 'application/json' },
            });
            
            toast.success("Logout realizado com sucesso!");
            router.push("/login");

        } catch (error) {
            console.error("Erro durante o logout:", error);
            
            // 💡 Tratamento de erro Axios
            const errorMessage = axios.isAxiosError(error) && error.response 
                ? error.response.data.erro || `Falha HTTP: ${error.response.status}`
                : "Erro desconhecido";
            
            toast.error(`Falha ao realizar logout: ${errorMessage}. Tente novamente.`);
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
                            <p className="text-sm text-gray-500 truncate">{user.email}</p>
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