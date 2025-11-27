'use client'

import { useEffect, useState } from "react"
import { Carousel } from "@/components/Carousel/Carousel"
import { Label } from "@/components/Label/Label"
import { ScheduleList } from "@/components/ScheduleList/ScheduleList"
import { ScheduleStatus } from "@/components/ScheduleStatus/ScheduleStatus"
import { api_url } from "@/utils/fetch-url"

type Reservation = {
  id: string
  resourceType: string
  purpose: string
  startTime: string
  endTime: string
  status: string
}

type Lecture = {
  id: string
  subjectName: string
  startTime: string
  endTime: string
  professor?: {
    name: string
    academicDegree: string
    expertiseArea: string
  }
}

export default function Home() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [lectures, setLectures] = useState<Lecture[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [reservationRes, lecturesRes] = await Promise.all([
          fetch(`${api_url}/api/reservation/person`, {
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          }),
          fetch(`${api_url}/api/lectures`, {
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          }),
        ])

        if (!reservationRes.ok || !lecturesRes.ok) {
          throw new Error("Erro ao carregar dados")
        }

        const reservationData = await reservationRes.json()
        const lecturesData = await lecturesRes.json()

        setReservations(reservationData)
        setLectures(lecturesData)
      } catch (err) {
        console.error("Erro ao buscar dados:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])
  return (
    <>
      <Carousel size="full" />

      <div className="flex flex-col gap-8 w-full">
        <div className="flex flex-wrap w-full gap-6">
          
          <Label
            title="Meus agendamentos"
            className="flex-grow flex-shrink w-[300px] h-auto"
          >
            {loading ? (
              <p>Carregando</p>
            ) : (
              <ScheduleStatus link="../reserves">
                <div className="flex flex-col gap-2">
                  <p className="font-semibold">Pedidos: {reservations.length}</p>
                </div>
              </ScheduleStatus>
            )}
          </Label>

          {/* Compromissos */}
          <Label
            title="Aulas"
            className="flex-[0.8] flex-shrink w-[300px]"
          >
            <ScheduleList >
              {loading ? (
                <p>Carregando aulas</p>
              ) : lectures.length > 0 ? (
                <ul className="flex flex-col gap-2">
                  {lectures.slice(0, 5).map((lecture) => (
                    <li
                      key={lecture.id}
                      className="border-b border-gray-200 pb-2 text-sm"
                    >
                      <strong>{lecture.subjectName}</strong>
                      <p>
                        Professor: {lecture.professor?.name ?? "Sem professor"}{" "}
                        ({lecture.professor?.academicDegree})
                      </p>
                      <p>
                        Horário: {lecture.startTime} - {lecture.endTime}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Nenhuma aula encontrada.</p>
              )}
            </ScheduleList>
          </Label>
        </div>
      </div>
    </>
  )
}
