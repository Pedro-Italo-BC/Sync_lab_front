import Link from "next/link"
import React, { ReactNode } from "react"

type ScheduleListProps = {
  children?: ReactNode
}

export function ScheduleList({ children }: ScheduleListProps) {
  return (
    <div className="w-80 min-h-32 max-h-52 bg-white items-between flex flex-col rounded-lg justify-between">
      <ul className="px-3 pt-6 flex flex-col overflow-hidden h-full bg-white">
        {children && React.Children.count(children) > 0 ? (
          children
        ) : (
          <>
            <li>
              <p className="ScheduleListItemTitle">Aula de Aeds - Prédio 43</p>
              <span className="ScheduleListItemDate">8:50 - 10:30</span>
            </li>
            <li>
              <p className="ScheduleListItemTitle">Aula de Aeds - Prédio 43</p>
              <span className="ScheduleListItemDate">8:50 - 10:30</span>
            </li>
               <li>
              <p className="ScheduleListItemTitle">Aula de Aeds - Prédio 43</p>
              <span className="ScheduleListItemDate">8:50 - 10:30</span>
            </li>
               <li>
              <p className="ScheduleListItemTitle">Aula de Aeds - Prédio 43</p>
              <span className="ScheduleListItemDate">8:50 - 10:30</span>
            </li>   <li>
              <p className="ScheduleListItemTitle">Aula de Aeds - Prédio 43</p>
              <span className="ScheduleListItemDate">8:50 - 10:30</span>
            </li>
               <li>
              <p className="ScheduleListItemTitle">Aula de Aeds - Prédio 43</p>
              <span className="ScheduleListItemDate">8:50 - 10:30</span>
            </li>   <li>
              <p className="ScheduleListItemTitle">Aula de Aeds - Prédio 43</p>
              <span className="ScheduleListItemDate">8:50 - 10:30</span>
            </li>
          </>
        )}
      </ul>

      <Link href="/events" className="border-t-1 border-black w-full flex items-center justify-center cursor-pointer bg-white hover:brightness-90 duration-300 ease-in-out transition rounded-b-lg font-bold h-10">
        Ver todos
      </Link>
    </div>
  )
}
