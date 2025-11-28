import React, { useState, useEffect, useCallback } from "react";

// --- SIMULAÇÕES DE DEPENDÊNCIAS E UTILS ---

// 1. Mock: next/navigation (useRouter)
const useRouter = () => ({
    push: (path) => {
        console.log(`[ROUTER MOCK] Navegando para: ${path}`);
        window.location.hash = path; // Simulação visual de rota
    },
});

// 2. Mock: @mui/icons-material/Person
const Person = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className={props.className || "w-6 h-6"}>
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
    </svg>
);

// 3. Mock: react-hot-toast
const toast = {
    success: (msg) => console.log(`[TOAST SUCESSO] ${msg}`),
    error: (msg) => console.error(`[TOAST ERRO] ${msg}`),
};

// 4. Mock: @/utils/jwt-utils e lógica de Token (Usando localStorage)
const ACCESS_TOKEN_KEY = 'access_token_mock';
const jwtUtils = {
    // Simula a obtenção do ID do usuário a partir de um token salvo
    getSub: () => {
        // Para fins de teste, retorna um ID se o token mock estiver presente
        return localStorage.getItem(ACCESS_TOKEN_KEY) ? 'mock-user-12345' : null;
    },
    isLoggedIn: () => {
         // Token é considerado "válido" se estiver presente
         return !!localStorage.getItem(ACCESS_TOKEN_KEY);
    },
    logout: () => {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        console.log("JWT Mock: Token de acesso e refresh removidos.");
    },
    // Adicionado para permitir o login no console para testes
    setToken: (token) => {
        localStorage.setItem(ACCESS_TOKEN_KEY, token);
    }
};

// 5. Mock: @/utils/fetch-url e URLs
const api_url = 'https://mock-api.com'; 
const API_BASE_URL = `${api_url}/api`; 
const LOGOUT_URL = `${api_url}/auth/logout`; 
const PERSON_URL = `${API_BASE_URL}/person`; 
const DEFAULT_IMAGE = "https://placehold.co/100x100/CCCCCC/000000?text=USER"; // Usando placehold.co

// --- FIM DAS SIMULAÇÕES ---

// Definições de Tipo (Movidas para o escopo do arquivo)
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

// Componente Principal
export default function Avatar({ src }: AvatarProps) {
    const [open, setOpen] = useState(false);
    const [user, setUser] = useState<UserState>(null);
    const [isLoading, setIsLoading] = useState(true);
    
    // Inicializa userId lendo o token ao montar.
    const [userId, setUserId] = useState(() => {
        const sub = jwtUtils.getSub();
        return sub || '';
    });

    const router = useRouter();

    // Lógica para buscar dados (agora MOCKADA)
    const fetchUserData = useCallback(async (currentUserId: string) => {
        if (!currentUserId || !jwtUtils.isLoggedIn()) {
            setUser(null);
            setIsLoading(false);
            return;
        }

        try {
            console.log(`[Avatar] Simulação de busca de dados para ID: ${currentUserId}`);
            await new Promise(resolve => setTimeout(resolve, 500)); // Simula delay de rede

            // --- SIMULAÇÃO DE RESPOSTA DE SUCESSO DA API ---
            const mockData: PersonData = {
                id: currentUserId,
                name: "Usuário Mock Teste",
                phoneNumber: "123456789",
                cpf: "000.000.000-00",
                birthDate: "01/01/2000",
                profileUrl: DEFAULT_IMAGE, 
                description: "Usuário de Teste",
                personCode: "MOCK001",
                role: 'STUDENT',
            };
            const data: PersonData = mockData;
            // --- FIM SIMULAÇÃO ---
            
            // O bloco de fetch real foi removido/comentado.
            // ... (código original fetch)

            if (data != null && data.id) {
                const loggedInUser = data; 
                
                // Email mockado baseado no nome, como no código original
                const emailMock = loggedInUser.name.toLowerCase().replace(/\s/g, '.') + "@email.com";
                
                const profileImage = (loggedInUser.profileUrl && loggedInUser.profileUrl !== "") 
                    ? loggedInUser.profileUrl 
                    : DEFAULT_IMAGE;

                setUser({
                    name: loggedInUser.name,
                    email: emailMock,
                    image: profileImage
                });
            } else {
                 throw new Error("Dados do usuário vazios ou inválidos na simulação.");
            }

        } catch (error) {
            console.error("Erro ao carregar dados do usuário:", error);
            // Definindo um estado de erro (sem precisar de !user assertion)
            setUser(null);
            
            // Adicionando uma mensagem de erro no caso de falha de autenticação/dados
            if(jwtUtils.isLoggedIn()){
                 toast.error("Falha ao carregar dados do perfil. Redirecionando.");
                 jwtUtils.logout(); // Limpa tokens se a busca falhar
                 router.push("/login"); 
            }
           
        } finally {
            setIsLoading(false);
        }
    }, [router]);

    useEffect(() => {
        const currentSub = jwtUtils.getSub();
        if (currentSub) {
            setUserId(currentSub);
            fetchUserData(currentSub);
        } else {
             setIsLoading(false);
             // Se não houver token, redireciona para login (comportamento Next.js esperado)
             router.push("/login");
        }
    }, [fetchUserData, router]);


    async function handleLogout() {
        setOpen(false);
        try {
            // --- SIMULAÇÃO DO LOGOUT ---
            console.log("[Logout] Simulação de logout no servidor.");
            await new Promise(resolve => setTimeout(resolve, 300)); // Simula delay de logout

            // O fetch real foi removido/comentado.
            // ... (código original fetch)
            
            // Se a simulação for bem-sucedida, limpa localmente
            jwtUtils.logout(); 
            toast.success("Desconectado com sucesso.");
            router.push("/login"); 
        } catch (error: any) {
            console.error("Erro durante o logout:", error);
            toast.error(`Falha ao realizar logout: ${error.message}. Desconectando localmente.`);
            jwtUtils.logout();
            router.push("/login");
        }
    }

    // Função auxiliar para renderizar a imagem ou o ícone padrão
    const renderAvatarImage = (size: 'small' | 'large' = 'small') => {
        // Assertivas de tipo removidas, pois `user` é checado antes
        const currentImage = user?.image || DEFAULT_IMAGE;
        const isDefault = currentImage === DEFAULT_IMAGE;
        const widthHeight = size === 'small' ? 'w-10 h-10' : 'w-12 h-12';
        const iconSize = size === 'small' ? 'w-6 h-6' : 'w-7 h-7';

        if (isDefault) {
            return (
                <div className={`${widthHeight} flex items-center justify-center rounded-full bg-gray-200`}>
                    <Person className={`${iconSize} text-black`} />
                </div>
            );
        }

        return (
            <img
                src={currentImage}
                alt="Avatar"
                className={`${widthHeight} rounded-full object-cover`} 
            />
        );
    };

    if (isLoading) {
        return <div className="rounded-full w-10 h-10 bg-gray-300 animate-pulse"></div>;
    }
    
    // Se o usuário não estiver carregado (ou foi deslogado)
    if (!user) {
         return (
            <button
                onClick={() => router.push('/login')}
                className="rounded-full p-0 bg-gray-100 cursor-pointer hover:opacity-90 duration-300 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-200">
                    <Person className="w-6 h-6 text-black" />
                </div>
            </button>
        );
    }

    return (
        <div className="relative">
            {/* Botão Avatar */}
            <button
                onClick={() => setOpen(!open)}
                // Removido o bg-[var(--background)] para um valor fixo que funcione com Tailwind no ambiente
                className="rounded-full p-0 bg-white cursor-pointer hover:brightness-90 duration-300 transition focus:outline-none focus:ring-2 focus:ring-blue-500" 
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