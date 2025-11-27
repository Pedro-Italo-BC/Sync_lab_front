import Link from "next/link"
import { ReactNode } from "react"
import {ArrowForwardIos} from '@mui/icons-material'

type StatusButtonProps = {
    children: ReactNode;
    link: string 
}
export function ScheduleStatus({children,link}: StatusButtonProps) {
    return (
        <div className="h-full flex-1 w-full rounded-lg flex bg-gradient-to-br from-[var(--blue-100)] to-[var(--cyan-100)] justify-between items-center text-white text-4xl font-bold capitalize ">
            <div className="p-6 w-full">
                {children}
            </div>
            <Link href={link} className="hover:brightness-90 transition duration-300 ease-in-out rounded-r-lg h-full w-16 text-white flex items-center justify-center border-l-2 border-white bg-transparent"><ArrowForwardIos/></Link>
        </div>
    )
}