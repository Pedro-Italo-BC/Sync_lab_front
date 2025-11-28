'use client'
import PucMinasImage from '../../../public/puc-minas-coreu.png'
import SyncLabLogo from '../../../public/Logo.png'

import { Input } from '@/components/Input/Input';
import Image from "next/image";
import { Button } from '@/components/Button/Button';

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from "react-hook-form"
import * as z from 'zod'
import { useRouter } from 'next/navigation'
import { useState } from 'react';
import toast from 'react-hot-toast';
import { api_url } from '@/utils/fetch-url';
import Cookies from 'js-cookie'
import axios from 'axios'; // Importa o Axios

const BASE_URL = `${api_url}/auth`

// Configuração global do Axios para incluir cookies em todas as requisições
axios.defaults.baseURL = api_url;
axios.defaults.withCredentials = true;

const loginFormSchema = z.object({
    email: z.email({ message: "Email inválido" }),
    password: z.string().min(5, { message: "A senha tem que ter no mínimo 5 caracteres" }),
});

type loginFormData = z.infer<typeof loginFormSchema>

export default function Login() {
    const { handleSubmit, register, control, formState: { errors } } = useForm<loginFormData>({
        resolver: zodResolver(loginFormSchema),
        mode: "onChange",
        reValidateMode: "onChange"
    })

    const [isLoading, setIsLoading] = useState<boolean>(false)

    const router = useRouter()

    async function onSubmit(data: loginFormData) {
        setIsLoading(true)
        console.log(isLoading)
        try {
            const body = {
                credential: {
                    email: data.email,
                    password: data.password
                }
            };
            
            // Usando Axios para a requisição de login
            const res = await axios.post(`${BASE_URL}/login`, body, {
                headers: { 'Content-Type': 'application/json' },
            });
            
            // Axios retorna o JSON em .data
            const dataRes = res.data; 

            toast.success("Logado com sucesso");

            // Manter a lógica de extração de token original, assumindo que
            // o backend ainda retorna as strings com Path, Max-Age, etc.
            // conforme a estrutura que você estava processando.
            const accessRaw = dataRes.token.access_token;
            const refreshRaw = dataRes.token.refresh_token;

            const accessToken = accessRaw.split("=")[1].split(";")[0];
            const refreshToken = refreshRaw.split("=")[1].split(";")[0];

            // A definição dos cookies via document.cookie é menos segura (não httpOnly), 
            // mas é a lógica original que você estava usando para compatibilidade.
            // Nota: O ideal é que o Set-Cookie do backend defina o cookie httpOnly.
            document.cookie = `access_token=${accessToken}; path=/; max-age=86400; Secure; SameSite=None`;
            document.cookie = `refresh_token=${refreshToken}; path=/; max-age=604800; Secure; SameSite=None`;

            localStorage.setItem("access_token", `${accessToken}`);
            localStorage.setItem("refresh_token", `${refreshToken}`);

            console.log(Cookies.get('access_token'))


            router.push('/home');

        } catch (err) {
            // O Axios lança um erro se o status for 4xx/5xx
            if (axios.isAxiosError(err) && err.response) {
                // Tentativa de ler a mensagem de erro do corpo da resposta do backend
                const errorMessage = err.response.data.erro || err.response.data.message;
                toast.error(errorMessage || "Email ou senha incorreta");
            } else {
                toast.error("Algo deu errado")
                console.error(err)
            }
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className='h-screen bg-[var(--foreground)] flex flex-1'>
            <Image src={PucMinasImage} draggable={false} alt="puc minas" className='h-full w-1/2 rounded-lg drop-shadow-[0_4px_16.5px_rgba(0,0,0,0.25)]' />
            <section className='flex flex-col content-center justify-center w-1/2 h-screen py-10'>
                <Image draggable={false} src={SyncLabLogo} alt='SyncLab' className='self-center' width={320} />
                <div className='w-full px-24 flex flex-col gap-4'>
                    <h1 className='text-4xl font-bold '>Login</h1>
                    <form onSubmit={handleSubmit(onSubmit)} action="" className='flex flex-col gap-6 '>
                        <div>
                            <label className="block text-sm font-bold text-[var(--blue-50)] mb-1">Email</label>
                            <Input className="w-full" type="email" {...register("email")} placeholder='Coloque seu email' />
                            {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-[var(--blue-50)] mb-1">Senha</label>
                            <Input className="w-full" type="password" {...register("password")} placeholder='Coloque sua senha' />
                            {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
                        </div>


                        <Button title='Entrar' buttonStyle='PRIMARY' disabled={isLoading}/>
                    </form>
                </div>
            </section>
        </div>
    )
}