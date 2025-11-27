'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, Controller } from "react-hook-form"
import * as z from 'zod'
import Link from "next/link";
import { AvatarInput } from "@/components/AvatarInput/AvatarInput";
import { Input } from "@/components/Input/Input";
import { SelectInput } from "@/components/Input/SelectInput";
import { ArrowBack } from "@mui/icons-material";
import {api_url} from '../../../../utils/fetch-url'
import { useState, useEffect } from 'react';
import { uploadImage } from '@/utils/uploadImage';

const registerFormSchema = z.object({
    name: z.string().min(3, { message: "O nome tem que ter pelo menos 3 caracteres" }),
    codePerson: z.string().min(7, { message: "O código deve ter 7 caracteres" }).max(7, { message: "O código deve ter no máximo 7 caracteres" }),
    email: z.email({ message: "Email inválido" }),
    password: z.string().min(5, { message: "A senha tem que ter no mínimo 5 caracteres" }),
    date: z.date(),
    cpf: z.string().length(11, { message: "CPF deve ter 11 dígitos" }),
    role: z.enum(["Estudante", "Professor", "Admin"]),
    course: z.string().optional(),
    semester: z.string().optional(),
    shift: z.enum(["Morning", "Afternoon", "Night"]).optional(),
    scholarshipType: z.enum(["None", "Partial", "Full"]).optional(),
    academicStatus: z.enum(["Active", "Locked", "Graduated"]).optional(),
    monitor: z.boolean().optional(),
    academicDegree: z.enum(["Mestrado", "Doutorado", "Posdoc"]).optional(),
    expertiseArea: z.string().optional(),
    employmentStatus: z.enum(["Ativo", "Licença", "Afastado"]).optional(),
    jobTitle: z.string().optional(),
})

type RegisterFormData = z.infer<typeof registerFormSchema>

export default function RegisterPerson() {
    const { handleSubmit, register, control, formState: { errors, isSubmitting }, watch } = useForm<RegisterFormData>({
        resolver: zodResolver(registerFormSchema),
        mode: "onChange",
        reValidateMode: "onChange"
    })
    
    const [responseMessage, setResponseMessage] = useState<string | null>(null);
    const [isError, setIsError] = useState(false);
    const [avatarFile, setAvatarFile] = useState<File | null>(null)
    const [courses, setCourses] = useState<any[]>([])
    const [selectedCourses, setSelectedCourses] = useState<string[]>([])

    const name = watch("name") || "Nome";
    const role = watch("role") || "Cargo";

    async function fetchData() {
        const resp = await fetch(`${api_url}/api/course`,
            {
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: 'include',
            }
        )
        const data = await resp.json();
        setCourses(data)
    } 

    useEffect(() => {
        if (role === "Professor") {
           fetchData();
        }
    }, [role])

    function toggleCourse(id: string) {
        setSelectedCourses(prev =>
            prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
        )
    }

    async function onSubmit(data: RegisterFormData) {
        setResponseMessage(null);
        setIsError(false);

        let profileUrl = ""

        if (avatarFile) {
            const uploadedUrl = await uploadImage(avatarFile)
            if (uploadedUrl) profileUrl = uploadedUrl
            else {
                setResponseMessage("Falha ao enviar a imagem.")
                setIsError(true)
                return
            }
        }

        let payload: any = {
            person: {
                name: data.name,
                phoneNumber: "400028922",
                cpf: data.cpf,
                birthDate: data.date.toISOString().split('T')[0],
                profileUrl: profileUrl,
                description: "",
                personCode: data.codePerson
            },
            credential: {
                email: data.email,
                password: data.password
            }
        }

        let endpoint = "";

        if (data.role === "Estudante") {
            endpoint = "student"
            payload.student = {
                course: data.course,
                semester: data.semester,
                shift: data.shift,
                scholarshipType: data.scholarshipType,
                academicStatus: data.academicStatus
            }
        } else if (data.role === "Professor") {
            endpoint = "professor"
            payload.professor = {
                academicDegree: data.academicDegree,
                expertiseArea: data.expertiseArea,
                employmentStatus: data.employmentStatus
            }
            payload.courses = selectedCourses
        } else if (data.role === "Admin") {
            endpoint = "admin"
            payload.admin = {
                jobTitle: data.jobTitle,
            }
        }

        try {
            const res = await fetch(`${api_url}/api/${endpoint}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: 'include',
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                try {
                    const errorBody = await res.json();
                    throw new Error(errorBody.erro || `Falha HTTP: ${res.status} ${res.statusText}`);
                } catch (e) {
                    throw new Error(`O servidor retornou um erro ${res.status} (${res.statusText})`);
                }
            }
            
            const contentType = res.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
                const data = await res.json();
                setResponseMessage(data.mensagem || "Cadastro realizado com sucesso!");
                setIsError(false);
            } else {
                setResponseMessage("Cadastro realizado com sucesso.");
                setIsError(false);
            }

        } catch (err: any) {
            setResponseMessage(`Erro ao cadastrar: ${err.message}`);
            setIsError(true);
        }
    }

    return (
        <div className="flex gap-8 w-full">
            <div className="w-2xs flex flex-col gap-2.5">
                <div className="flex flex-col w-full h-40 rounded-lg bg-[var(--foreground)] ">
                    <div className="w-full h-1/2 bg-[var(--blue-50)] rounded-t-lg relative z-20">
                        <AvatarInput onFileSelect={setAvatarFile}/>
                        <p className="w-1/2 text-left absolute bottom-0 right-6 text-lg text-white font-extrabold truncate">
                            {name}
                        </p>
                    </div>

                    <div className="w-full h-1/2 rounded-b-lg relative">
                        <p className="w-1/2 text-left absolute top-0 right-6 text-lg text-[var(--blue-50)] font-medium truncate">
                            {role}
                        </p>
                    </div>
                </div>

                <Link
                    href="/admin"
                    className="bg-[var(--foreground)] w-full flex justify-center items-center h-12 rounded-lg hover:bg-red-500 hover:text-white cursor-pointer duration-300 transition"
                >
                    <ArrowBack />
                </Link>
            </div>

            <main className="bg-[var(--foreground)] flex-1 h-full rounded-lg flex items-center justify-center p-8">
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="flex flex-col gap-6 w-full"
                >
                    {responseMessage && (
                        <div className={`p-4 rounded-lg font-semibold ${isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                            {isError ? "❌ " : "✅ "}
                            {responseMessage}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-bold text-[var(--blue-50)] mb-1">Nome</label>
                        <Input className="w-full" placeholder="Digite seu nome" {...register("name")} />
                        {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-[var(--blue-50)] mb-1">Código</label>
                        <Input className="w-full" placeholder="Digite o código" {...register("codePerson")} />
                        {errors.codePerson && <p className="text-red-500 text-sm">{errors.codePerson.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-[var(--blue-50)] mb-1">Email</label>
                        <Input className="w-full" type="email" placeholder="Digite seu email" {...register("email")} />
                        {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-[var(--blue-50)] mb-1">Senha</label>
                        <Input className="w-full" type="password" placeholder="Digite sua senha" {...register("password")} />
                        {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-[var(--blue-50)] mb-1">Data de Nascimento</label>
                        <Input className="w-full" type="date" {...register("date", { valueAsDate: true })} />
                        {errors.date && <p className="text-red-500 text-sm">{errors.date.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-[var(--blue-50)] mb-1">CPF</label>
                        <Input className="w-full" placeholder="Digite seu CPF" {...register("cpf")} />
                        {errors.cpf && <p className="text-red-500 text-sm">{errors.cpf.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-[var(--blue-50)] mb-1">Tipo de acesso</label>
                        <Controller
                            control={control}
                            name="role"
                            render={({ field }) => (
                                <SelectInput label="Tipo de acesso" options={["Estudante", "Professor", "Admin"]} control={control} name="role" />
                            )}
                        />
                        {errors.role && <p className="text-red-500 text-sm">{errors.role.message}</p>}
                    </div>

                    {role === "Estudante" && (
                        <>
                            <div>
                                <label className="block text-sm font-bold text-[var(--blue-50)] mb-1">Curso</label>
                                <Input className="w-full" placeholder="Digite o curso" {...register("course")} />
                                {errors.course && <p className="text-red-500 text-sm">{errors.course.message}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-[var(--blue-50)] mb-1">Semestre</label>
                                <Input className="w-full" placeholder="Digite o semestre" {...register("semester")} />
                                {errors.semester && <p className="text-red-500 text-sm">{errors.semester.message}</p>}
                            </div>

                            <div>
                                <SelectInput label="Turno" control={control} options={["Morning", "Afternoon", "Night"]} {...register("shift")} />
                                {errors.shift && <p className="text-red-500 text-sm">{errors.shift.message}</p>}
                            </div>

                            <div>
                                <SelectInput label="Tipo de Bolsa" options={["None", "Partial", "Full"]} {...register("scholarshipType")} control={control} />
                                {errors.scholarshipType && <p className="text-red-500 text-sm">{errors.scholarshipType.message}</p>}
                            </div>

                            <div>
                                <SelectInput label="Status Acadêmico" options={["Active", "Locked", "Graduated"]} {...register("academicStatus")} control={control} />
                                {errors.academicStatus && <p className="text-red-500 text-sm">{errors.academicStatus.message}</p>}
                            </div>
                        </>
                    )}

                    {role === "Professor" && (
                        <>
                            <div>
                                <SelectInput label="Titulação" options={["Mestrado", "Doutorado", "Posdoc"]} {...register("academicDegree")} control={control} />
                                {errors.academicDegree && <p className="text-red-500 text-sm">{errors.academicDegree.message}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-[var(--blue-50)] mb-1">Área de Expertise</label>
                                <Input className="w-full" placeholder="Digite a área de expertise" {...register("expertiseArea")} />
                                {errors.expertiseArea && <p className="text-red-500 text-sm">{errors.expertiseArea.message}</p>}
                            </div>

                            <div>
                                <SelectInput label="Status de Emprego" options={["Ativo", "Licença", "Afastado"]} {...register("employmentStatus")} control={control} />
                                {errors.employmentStatus && <p className="text-red-500 text-sm">{errors.employmentStatus.message}</p>}
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                {courses.map(course => (
                                    <div
                                        key={course.id}
                                        onClick={() => toggleCourse(course.id)}
                                        className={`cursor-pointer p-4 rounded-lg border ${
                                            selectedCourses.includes(course.id)
                                                ? "bg-[var(--blue-50)] text-white"
                                                : "bg-[var(--foreground)] text-[var(--blue-50)]"
                                        }`}
                                    >
                                        <p className="font-bold">{course.name}</p>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {role === "Admin" && (
                        <>
                            <div>
                                <label className="block text-sm font-bold text-[var(--blue-50)] mb-1">Cargo</label>
                                <Input className="w-full" placeholder="Digite o cargo" {...register("jobTitle")} />
                                {errors.jobTitle && <p className="text-red-500 text-sm">{errors.jobTitle.message}</p>}
                            </div>
                        </>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full h-12 mt-2 cursor-pointer rounded-lg bg-[var(--blue-100)] text-white font-semibold hover:brightness-110 transition"
                    >
                        {isSubmitting ? "Salvando..." : "Salvar"}
                    </button>
                </form>
            </main>
        </div>
    )
}
