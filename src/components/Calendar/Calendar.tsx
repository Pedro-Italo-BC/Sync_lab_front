'use client'

import { CaretLeft, CaretRight } from 'phosphor-react'
import { useMemo, useState } from 'react'
import { getWeekDays } from '@/utils/get-week-days'
import dayjs from 'dayjs'
import { useRouter } from 'next/router'
// import { useQuery } from '@tanstack/react-query'
// import { api } from '@/lib/axios'

interface CalendarWeek {
    week: number
    days: Array<{
        date: dayjs.Dayjs
        disabled: boolean
    }>
}

type CalendarWeeks = CalendarWeek[]

interface BlockedDates {
    blockedWeekDays: number[]
    blockedDates: number[]
}

interface CalendarProps {
    selectedDate: Date | null
    onDateSelected: (date: Date) => void
}

export function Calendar({ onDateSelected, selectedDate }: CalendarProps) {
    const [currentDate, setCurrentDate] = useState(() => {
        return dayjs().set('date', 1)
    })

    //   const router = useRouter()
    const username = 'demo-user';

    function handlePreviousMonth() {
        const previousMonthDate = currentDate.subtract(1, 'month')
        setCurrentDate(previousMonthDate)
    }

    function handleNextMonth() {
        const nextMonthDate = currentDate.add(1, 'month')
        setCurrentDate(nextMonthDate)
    }

    const shortWeekDays = getWeekDays({ short: true })
    const currentMonth = currentDate.format('MMMM')
    const currentYear = currentDate.format('YYYY')
    //   const username = String(router.query.username)

    // Simulação de dados enquanto o backend não está disponível
    const blockedDates: BlockedDates = {
        blockedWeekDays: [0, 6], // bloqueia domingos e sábados
        blockedDates: [10, 15, 22], // bloqueia dias específicos do mês
    }

    // const { data: blockedDates } = useQuery<BlockedDates>(
    //   ['blocked-dates', currentDate.get('year'), currentDate.get('month')],
    //   async () => {
    //     const response = await api.get(`/users/${username}/blocked-dates`, {
    //       params: {
    //         year: currentDate.get('year'),
    //         month: currentDate.get('month') + 1,
    //       },
    //     })
    //     return response.data
    //   },
    // )

    const calendarWeeks = useMemo(() => {
        if (!blockedDates) return []

        const daysInMonthArray = Array.from({ length: currentDate.daysInMonth() }).map((_, i) =>
            currentDate.set('date', i + 1)
        )

        const firstWeekDay = currentDate.get('day')

        const previousMonthFillArray = Array.from({ length: firstWeekDay })
            .map((_, i) => currentDate.subtract(i + 1, 'day'))
            .reverse()

        const lastDayInCurrentMonth = currentDate.set('date', currentDate.daysInMonth())
        const lastWeekDay = lastDayInCurrentMonth.get('day')

        const nextMonthFillArray = Array.from({ length: 7 - (lastWeekDay + 1) }).map((_, i) =>
            lastDayInCurrentMonth.add(i + 1, 'day')
        )

        const calendarDays = [
            ...previousMonthFillArray.map((date) => ({ date, disabled: true })),
            ...daysInMonthArray.map((date) => ({
                date,
                disabled:
                    date.endOf('day').isBefore(new Date()) ||
                    blockedDates.blockedWeekDays.includes(date.get('day')) ||
                    blockedDates.blockedDates.includes(date.get('date')),
            })),
            ...nextMonthFillArray.map((date) => ({ date, disabled: true })),
        ]

        const calendarWeeks = calendarDays.reduce<CalendarWeeks>((weeks, _, i, original) => {
            const isNewWeek = i % 7 === 0
            if (isNewWeek) {
                weeks.push({
                    week: i / 7 + 1,
                    days: original.slice(i, i + 7),
                })
            }
            return weeks
        }, [])

        return calendarWeeks
    }, [currentDate, blockedDates])

    return (
        <div className="flex flex-col gap-6 p-6">
            <div className="flex items-center justify-between">
                <h2 className="font-bold capitalize text-black">
                    {currentMonth} <span className="text-gray-400">{currentYear}</span>
                </h2>
                <div className="flex gap-2 text-black">
                    <button
                        onClick={handlePreviousMonth}
                        title="Previous Month"
                        className="cursor-pointer rounded-sm focus:outline-none focus:ring-2 focus:ring-gray-100 hover:brightness-90 duration-300 transition"
                    >
                        <CaretLeft className="w-5 h-5" />
                    </button>
                    <button
                        onClick={handleNextMonth}
                        title="Next Month"
                        className="cursor-pointer rounded-sm focus:outline-none focus:ring-2 focus:ring-gray-100 hover:brightness-90 duration-300 transition"
                    >
                        <CaretRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <table className="w-full border-separate border-spacing-2 table-fixed font-sans">
                <thead>
                    <tr>
                        {shortWeekDays.map((weekDay) => (
                            <th
                                key={weekDay}
                                className="text-[var(--gray-200)] font-medium text-sm text-center"
                            >
                                {weekDay}
                            </th>
                        ))}
                    </tr>
                </thead>

                <tbody>
                    <tr className="leading-3 before:content-['.'] before:block before:h-2 before:text-[var(--background)]" />
                    {calendarWeeks.map(({ week, days }) => (
                        <tr key={week}>
                            {days.map(({ date, disabled }) => (
                                <td key={date.toString()} className="box-border text-center">
                                    <button
                                        onClick={() => onDateSelected(date.toDate())}
                                        disabled={disabled}
                                        className={`w-12 h-12 text-sm rounded-md transition-all duration-200 shadow-sm ${disabled
                                                ? 'bg-[var(--gray-300)] text-[var(--black)] cursor-default opacity-60'
                                                : 'bg-[var(--blue-50)] text-white hover:bg-[var(--blue-100)] cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--gray-200)]'
                                            }`}
                                    >
                                        {date.get('date')}
                                    </button>
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}