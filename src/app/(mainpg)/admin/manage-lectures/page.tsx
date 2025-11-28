'use client'

import { useState, useEffect, useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { ArrowBack, Edit, Delete, Add, Save, Cancel, Sync } from "@mui/icons-material";
import { api_url } from "@/utils/fetch-url";
import toast from "react-hot-toast";
const API_BASE_URL = `${api_url}/api`;
import Cookies from "js-cookie";

interface Professor {
  id: string;
  name: string;
  academicDegree: string;
  expertiseArea: string;
}

interface Room {
  id: string;
  capacity: number;
  roomType: string;
  code: string;
  status: string;
  imageUrl: string;
  buildingId: string | null;
  floor: number;
  createdAt: string;
  updatedAt: string;
}

interface DateObj {
  value: string;
}

interface Lecture {
  id?: string;
  subjectName: string;
  professorId: string;
  endDate: string;
  roomId: string;
  date: DateObj;
  studentQuantity: number;
  isAppellant: boolean;
  courseId?: string | null;
  lectureType?: {value: string | null};
  professor?: Professor | null;
  room?: Room | null;
}

const LECTURE_RECURRENCE_OPTIONS = ["Só uma vez", "Recorrente"] as const;
type RecurrenceStatus = typeof LECTURE_RECURRENCE_OPTIONS[number];



const lectureSchema = z.object({
  subjectName: z.string().min(3, "O nome da aula deve ter no mínimo 3 caracteres."),
  professorId: z.string().uuid("Selecione um professor válido."),
  roomId: z.string().uuid("Selecione uma sala válida."),
  status: z.enum(LECTURE_RECURRENCE_OPTIONS),
  dateValue: z.string().nullable().optional(), // opcional no esquema base
  weekDays: z.number().array().optional(), // opcional no esquema base
  timeValue: z.string().optional(), // opcional no esquema base
  studentQuantity: z.number().min(1, "A quantidade de alunos deve ser no mínimo 1."),
  courseId: z.string().uuid("Curso inválido").optional().nullable(),
  lectureType: z.string().optional().nullable(),
}).superRefine((data, ctx) => {
  // VALIDAÇÃO SINGLE (Só uma vez)
  if (data.status === LECTURE_RECURRENCE_OPTIONS[0]) {
    if (!data.dateValue || data.dateValue.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Para aulas únicas, a data e hora devem ser preenchidas.",
        path: ["dateValue"],
      });
    }
  }

  // VALIDAÇÃO RECORRENTE
  if (data.status === LECTURE_RECURRENCE_OPTIONS[1]) {
    if (!data.weekDays || data.weekDays.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Selecione ao menos um dia da semana.",
        path: ["weekDays"], // Pode ser útil para mostrar erro na seleção de dias
      });
    }
    if (!data.timeValue || data.timeValue.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Preencha o horário da aula recorrente.",
        path: ["timeValue"],
      });
    }
  }
});


type LectureFormData = z.infer<typeof lectureSchema> & { code?: string };

export default function UnifiedEntityManagerPage() {
  const [currentList, setCurrentList] = useState<Lecture[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingEntity, setEditingEntity] = useState<Lecture | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [selectedDateInput, setSelectedDateInput] = useState<"SINGLE" | "NOT_SINGLE">("SINGLE")
  const [courses, setCourses] = useState([])

  const { schema, defaultValues } = useMemo(() => ({
    schema: lectureSchema,
    defaultValues: {
      subjectName: "",
      professorId: "",
      roomId: "",
      status: LECTURE_RECURRENCE_OPTIONS[1] as RecurrenceStatus, // Padrão: Recorrente
      dateValue: null,
      weekDays: [],
      timeValue: "",
      studentQuantity: 1,
      courseId: null,
      lectureType: null,
      code: "",
    }

  }), []);

  
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset, setValue, watch, setError: setFormError } = useForm<LectureFormData>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as LectureFormData,
  });
  
  const selectedStatus = watch("status");


  async function fetchCourses() {
    const c = Cookies.get('access_token')

    try {
      const resp = await fetch(`${api_url}/api/course`, {
        headers: {"Content-Type": 'application/json', "Authorization": `Bearer ${c}`},
        credentials: 'include'
      })

      const data = await resp.json()

      setCourses(data)
    }catch(err){
      console.error(err)
    }

} 
  
const toDateHour = (hourMinutes: string, daysArray: number[] | undefined | null): string => {
    if (!daysArray || daysArray.length === 0 || !hourMinutes) {
        return '';
    }
    
    const daysNumbers = daysArray.sort().join('');

    if (daysNumbers.length === 0) {
        return '';
    }

    const [hour, minutes] = hourMinutes.split(':')

    return hour + minutes  + daysNumbers;
};
  useEffect(() => {
    // Sincroniza o watch('status') com o state local que controla a exibição dos campos de data
    if (selectedStatus === LECTURE_RECURRENCE_OPTIONS[0] && selectedDateInput !== "SINGLE") {
      setSelectedDateInput("SINGLE");
    } else if (selectedStatus === LECTURE_RECURRENCE_OPTIONS[1] && selectedDateInput !== "NOT_SINGLE") {
      setSelectedDateInput("NOT_SINGLE");
    }
  }, [selectedStatus, selectedDateInput]);

  useEffect(() => {
    const fetchDependencies = async () => {
      try {
        const [professorRes, roomRes] = await Promise.all([
          fetch(`${API_BASE_URL}/professorn`, { method: "GET", headers: { "Content-Type": "application/json" }, credentials: 'include' }),
          fetch(`${API_BASE_URL}/room`, { method: "GET", headers: { "Content-Type": "application/json" }, credentials: 'include' }),
        ]);

        if (!professorRes.ok) throw new Error("Erro ao carregar Professores");
        if (!roomRes.ok) throw new Error("Erro ao carregar Salas");

        const professorData: Professor[] = await professorRes.json();
        const roomData: Room[] = await roomRes.json();

        setProfessors(professorData || []);
        setRooms(roomData || []);
      } catch (err: any) {
        console.error(err);
        toast.error(`Falha ao carregar listas: ${err?.message || err}`);
      }
    };
    fetchCourses()
    fetchDependencies();
  }, []);

  function getDateArr(data: string) {
    let resp = [];
    for(let i = 3; i < data.length; i++){
      resp.push(parseInt(data[i]));  
    }

    return resp.sort();
  }

  function toDateTimeLocal(value: string | number) {
  const d = new Date(Number(value));

  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");

  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

function dateHourToTime(dateHour: string | number) {
  const v = String(dateHour).padStart(4, "0");

  const hh = v.substring(0, 2);
  const mm = v.substring(2, 4);

  return `${hh}:${mm}`;
}


function dateHourToWeekDays(dateHour: string | number) {
  const v = String(dateHour);

  if (v.length <= 4) return [];

  const daysPart = v.substring(4);
  return daysPart.split("").map(n => Number(n));
}


function formatTime(dateStr: string) {
  const d = new Date(dateStr);

  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");

  return `${hh}:${mm}`;
}
  
  const fetchEntities = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const c = Cookies.get('access_token')

    try {
      const response = await fetch(`${API_BASE_URL}/lectures`, { method: "GET", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${c}`}, credentials: 'include' });
      if (!response.ok) throw new Error(response.statusText || 'Erro ao buscar aulas');
      const data: Lecture[] = await response.json();
      setCurrentList(data || []);
    } catch (e: any) {
      setError(`Falha na API: ${e?.message || e}`);
      setCurrentList([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEntities();
    setEditingEntity(null);
    reset(defaultValues as LectureFormData);
  }, [fetchEntities, reset, defaultValues]);

  const handleEdit = (entity: Lecture) => {

    console.log(entity)
    setEditingEntity(entity);
const statusValue = entity.endDate ? "Só uma vez" : "Recorrente";

  reset({
  subjectName: entity.subjectName ?? "",
  professorId: entity.professorId ?? "",
  roomId: entity.roomId ?? "",
  status: statusValue,

  dateValue: undefined,  // você não tem data, só hora + dias

  studentQuantity: entity.studentQuantity ?? 1,
  courseId: entity.courseId ?? null,

  lectureType: entity.lectureType?.value ?? undefined,

  code: entity.subjectName ?? "",

  weekDays: dateHourToWeekDays(entity.date.value),

  timeValue: dateHourToTime(entity.date.value),
});
  };

  const handleCreateNew = () => {
    setEditingEntity(null);
    setSelectedDateInput("SINGLE");
    reset(defaultValues as LectureFormData);
  };

const onSubmit = async (data: LectureFormData) => {

  
  try {
      const isUpdating = !!editingEntity;
      const isSingle = data.status === LECTURE_RECURRENCE_OPTIONS[0];

      const payload = {
        // Mapeamento de status para isAppellant
        lecture: {
          subjectName: data.subjectName || data.code,
          date: { value: toDateHour(data.timeValue as string, data.weekDays as [])},
          endDate:  data.dateValue ? new Date(data.dateValue) : null,
          studentQuantity: Number(data.studentQuantity),
          courseId: data.courseId || null,
          timeValue: !isSingle && data.timeValue ? data.timeValue : null,
          lectureType: {value: data.lectureType},
        },
        room: {
          id: data.roomId,
        },
        professor: {
          id: data.professorId,
        }
      };

    const url = isUpdating ? `${API_BASE_URL}/lectures/${editingEntity?.id}` : `${API_BASE_URL}/lectures`;
    const method = isUpdating ? "PUT" : "POST";

    const c = Cookies.get('access_token')

    const response = await fetch(url, {
      method: method,
      headers: { "Content-Type": "application/json","Authorization": `Bearer ${c}` },
      body: JSON.stringify(payload),
      credentials: 'include'
    });

    if (!response.ok) {
        let errText = response.statusText;
        try { const errJson = await response.json(); errText = errJson.erro || JSON.stringify(errJson); } catch {}
        throw new Error(errText || `Erro ao ${isUpdating ? 'atualizar' : 'cadastrar'}`);
    }

    toast.success(`Aula ${isUpdating ? 'atualizada' : 'cadastrada'} com sucesso!`);
    
    // Limpar e recarregar
    setEditingEntity(null);
    reset(defaultValues as LectureFormData);
    fetchEntities();

  } catch (e: any) {
    console.error("API Error:", e);
    toast.error(`Falha na operação: ${e?.message || e}`);
  }
};
  const handleDelete = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja excluir esta aula?")) return;
    const c = Cookies.get('access_token')

    try {
      const response = await fetch(`${API_BASE_URL}/lectures/${id}`, { method: "DELETE", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${c}` }, credentials: 'include' });
      if (!response.ok) {
        let errText = response.statusText;
        try { const errJson = await response.json(); errText = errJson.erro || JSON.stringify(errJson); } catch {}
        throw new Error(errText || 'Erro ao excluir');
      }
      toast.success("Aula excluída com sucesso!");
      fetchEntities();
    } catch (e: any) {
      toast.error(`Erro ao excluir: ${e?.message || e}`);
    }
  };

  const FormFields = () => (<>
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-sm font-bold text-[var(--blue-50)] mb-1">Assunto da aula</label>
          <input className="w-full border-gray-300 border p-2 rounded-lg" placeholder="Ex: Banco de dados" {...register("subjectName", { onChange: (e) => setValue('code', e.target.value) })} />
          {errors.subjectName && <p className="text-red-500 text-sm">{`${errors.subjectName.message}`}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold text-[var(--blue-50)] mb-1">Professor</label>
        <select {...register("professorId")} className="w-full border border-gray-300 rounded-lg p-2">
          <option value="">Selecione um Professor</option>
          {professors.map((p) => {
            return (<option key={p.id} value={p.id}>{p.name} ({p.academicDegree})</option>)})}
        </select>
        {errors.professorId && <p className="text-red-500 text-sm">{`${errors.professorId.message}`}</p>}
      </div>

      <div>
        <label className="block text-sm font-bold text-[var(--blue-50)] mb-1">Sala</label>
        <select {...register("roomId")} className="w-full border border-gray-300 rounded-lg p-2">
          <option value="">Selecione uma Sala</option>
          {rooms.map((r) => (<option key={r.id} value={r.id}>{r.code} ({r.capacity} lugares) - Andar: {r.floor}</option>))}
        </select>
        {errors.roomId && <p className="text-red-500 text-sm">{`${errors.roomId.message}`}</p>}
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-sm font-bold text-[var(--blue-50)] mb-1 ">Quantidade de Alunos</label>
          <input className="w-full border-gray-300 border p-2 rounded-lg" placeholder="Ex: 40" type="number" min="1" {...register("studentQuantity", { valueAsNumber: true })} />
          {errors.studentQuantity && <p className="text-red-500 text-sm">{`${errors.studentQuantity.message}`}</p>}
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-sm font-bold text-[var(--blue-50)] mb-1">Recorrência</label>
          <select 
            {...register("status")} 
            className="w-full border border-gray-300 rounded-lg p-2"
            onChange={(e) => {
              setValue("status", e.target.value as RecurrenceStatus);
              // Sincroniza o estado de exibição dos inputs de data/hora
              setSelectedDateInput(e.target.value === LECTURE_RECURRENCE_OPTIONS[0] ? "SINGLE" : "NOT_SINGLE");
              setValue("status", LECTURE_RECURRENCE_OPTIONS[0]); 
            }}
          >
            {LECTURE_RECURRENCE_OPTIONS.map(status => (<option key={status} value={status}>{status}</option>))}
          </select>
          {errors.status && <p className="text-red-500 text-sm">{`${errors.status.message}`}</p>}
        </div>
      </div>

      <div className="block gap-4 w-full">
        <div className="w-full">

        {selectedDateInput === 'NOT_SINGLE' && (
          <>
            <div className="flex gap-2 mb-3 w-full justify-between">
              {['DOM','SEG','TER','QUA','QUI','SEX','SAB'].map((day, index) => (
                <button
                  type="button"
                  key={day}
                  onClick={() => {
                    const current = watch('weekDays') || [];
                    if (current.includes(index)) {
                      setValue('weekDays', current.filter((d: number) => d !== index));
                    } else {
                      setValue('weekDays', [...current, index]);
                    }
                  }}
                  className={`w-11 h-10 text-[.7rem] flex items-center justify-center rounded-full border cursor-pointer  font-medium hover:bg-blue-500 hover:text-white transition duration-300 ${watch('weekDays')?.includes(index) ? 'bg-blue-500 text-white border-white' : 'bg-white border-gray-400'}}`}

                >
                  {day}
                </button>
              ))}
            </div>
            {errors.weekDays && <p className="text-red-500 text-sm">Selecione ao menos um dia da semana.</p>}

            <div>
              <label className="block text-sm font-bold text-[var(--blue-50)] mb-1">Horário</label>
              <input type="time" className="w-full border-gray-300  border p-2 rounded-lg" {...register("timeValue")} />
              {errors.timeValue && <p className="text-red-500 text-sm">{`${errors.timeValue.message}`}</p>}
            </div>
          </>
        )}

        {selectedDateInput === 'SINGLE' && (
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-[var(--blue-50)]">Data e Hora</label>
            <input type="datetime-local" className="w-full border-gray-300 border p-2 rounded-lg" {...register("dateValue")} />
            {errors.dateValue && <p className="text-red-500 text-sm">{`${errors.dateValue.message}`}</p>}
          </div>
        )}
      </div>

      <div className="flex gap-4 mt-10 flex-col">
        <div className="flex-1">
          <label className="block text-sm font-bold text-[var(--blue-50)] mb-1">Curso (courseId)</label>
          {/* Este campo precisa ser ajustado para Course ID, ou removido/substituído se não for o objetivo */}
          <select {...register("courseId")} className="w-full border border-gray-300 rounded-lg p-2">
            <option value="">Selecione o Curso</option>
            {/* Adicionar aqui options de Course ID */}
            {/* Exemplo de IDs/Nomes fictícios */}

            {
              courses.map(({id, name}) => {
                return (
                   <option value={id}>{name}</option>
                )
              })
            }
          </select>
          {errors.courseId && <p className="text-red-500 text-sm">{`${errors.courseId.message}`}</p>}
        </div>
        <div className="flex-1">
          <label className="block text-sm font-bold text-[var(--blue-50)] mb-1">Tipo de Aula (lectureType)</label>
          {/* O campo de 'Tipo de Aula' estava duplicado e com o mesmo register('lectureType') - Mantenho apenas um */}
          <select {...register("lectureType")} className="w-full border border-gray-300 rounded-lg p-2">
            <option value="">Selecione tipo</option>
            <option value="THEORY">Informatica</option>
            <option value="PRACTICE">Monitoria</option>
            <option value="OTHER">Livre</option>
            <option value="OTHER">Quimica</option>
            <option value="OTHER">Oficina</option>

          </select>
          {errors.lectureType && <p className="text-red-500 text-sm">{`${errors.lectureType.message}`}</p>}
        </div>
      </div>
      </div>
    </>);

  const TableContent = () => (
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assunto</th>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Professor</th>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sala</th>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qtd. Alunos</th>
          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {currentList.map((lecture) => (
          <tr key={lecture.id} className={`hover:bg-gray-100 ${editingEntity?.id === lecture.id ? "bg-yellow-100" : "bg-white"}`}>
            <td className="px-4 py-3 text-sm font-medium text-gray-900">{lecture.subjectName}</td>
            <td className="px-4 py-3 text-sm text-gray-500">{lecture.professor?.name || 'N/A'}</td>
            <td className="px-4 py-3 text-sm text-gray-500">{lecture.room?.code || 'N/A'} (Cap: {lecture.room?.capacity ?? 'N/A'})</td>
            <td className="px-4 py-3 text-sm text-gray-500">{lecture.studentQuantity}</td>
            <td className="px-4 py-3 text-center text-sm font-medium">
              <button onClick={() => handleEdit(lecture)} className="text-indigo-600 hover:text-indigo-900 mr-3" disabled={isSubmitting}><Edit fontSize="small"/></button>
              <button onClick={() => handleDelete(lecture.id!)} className="text-red-600 hover:text-red-900" disabled={isSubmitting}><Delete fontSize="small"/></button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  if (isLoading && currentList.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl text-gray-600">Carregando dados...</p>
      </div>
    );
  }

  return (
    <div className="flex gap-8 w-full p-8">
      <aside className="w-1/3 flex flex-col gap-6">
        <header className="flex flex-col w-full rounded-lg bg-[var(--foreground)] p-6 shadow-md border-t-4 border-[var(--blue-100)]">
          <p className="text-2xl font-bold text-[var(--blue-50)] mb-2">Gerenciador de Aulas</p>
          <p className="text-sm text-gray-500">{editingEntity ? "Editando Aula" : "Cadastrando Nova Aula"}</p>
        </header>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 p-6 bg-[var(--foreground)] rounded-lg shadow-md">
          <FormFields />

          <hr className="border-[var(--separator)] my-2" />

          <div className="flex gap-2 mt-2">
            {editingEntity && (
              <button type="button" onClick={handleCreateNew} disabled={isSubmitting} className="flex-1 h-12 rounded-lg bg-gray-500 text-white font-semibold hover:bg-gray-600 transition flex items-center justify-center gap-2 shadow-md">
                <Cancel /> Cancelar
              </button>
            )}
      
            <button type="submit" onClick={() => console.log(courses)} disabled={isSubmitting} className={`flex-1 h-12 rounded-lg text-white font-semibold transition flex items-center justify-center gap-2 shadow-md ${editingEntity ? "bg-green-500 hover:bg-green-600" : "bg-[var(--blue-100)] hover:bg-blue-600"}`}>
              {isSubmitting ? "Salvando..." : editingEntity ? (<><Save /> Atualizar</>) : (<><Add /> Cadastrar</>)}
            </button>
          </div>
        </form>

        <Link href="/admin" className="bg-[var(--foreground)] w-full flex justify-center items-center h-12 rounded-lg hover:bg-gray-100 text-gray-700 font-semibold cursor-pointer duration-300 transition shadow-md">
          <ArrowBack className="mr-2" /> Voltar para o Admin
        </Link>
      </aside>

      <main className="bg-[var(--foreground)] flex-1 h-full rounded-lg p-6 shadow-md overflow-x-auto">
        <div className="flex justify-between items-center mb-4 border-b pb-4">
          <h2 className="text-2xl font-bold text-[var(--blue-50)]">Lista de Aulas</h2>
          <button onClick={fetchEntities} className="text-[var(--blue-100)] hover:text-indigo-900 p-2 rounded-full hover:bg-gray-100 transition" title="Recarregar Lista">
            <Sync />
          </button>
        </div>

        {error ? (
          <p className="text-red-700 p-4 border border-red-300 bg-red-100 rounded font-semibold">{error}</p>
        ) : currentList.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-xl text-gray-500">Nenhuma aula cadastrada.</p>
            <p className="text-gray-400 mt-2">Use o formulário ao lado para começar.</p>
          </div>
        ) : (
          <TableContent />
        )}
      </main>
    </div>
  );
}