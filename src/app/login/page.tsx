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
const BASE_URL = `${api_url}/auth`

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
    const res = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
            credential: {
                email: data.email,
                password: data.password
            }
        })
    });

    const dataRes = await res.json();

    if (res.ok) {
        toast.success("Logado com sucesso");

        const accessRaw = dataRes.token.access_token;
        const refreshRaw = dataRes.token.refresh_token;

        const accessToken = accessRaw.split("=")[1].split(";")[0];
        const refreshToken = refreshRaw.split("=")[1].split(";")[0];

        document.cookie = `access_token=${accessToken}; path=/; max-age=86400`;
        document.cookie = `refresh_token=${refreshToken}; path=/; max-age=604800`;

        localStorage.setItem("access_token", `${accessToken}`);
        localStorage.setItem("refresh_token", `${accessToken}`);

        console.log(Cookies.get('access_token'))


        // router.push('/home');
    } else {
        toast.error("Email ou senha incorreta");
    }

    } catch (err) {
            toast.error("Algo deu errado")
            console.error(err)
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
