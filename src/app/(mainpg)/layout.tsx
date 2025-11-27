'use client'
import { Aside } from "@/components/Aside/Aside"
import { Header } from "@/components/Header/Header"

type PageLayoutProps = {
    children: React.ReactNode
}

export default function PageLayout({children}: PageLayoutProps) {
    return (
        <>
        <Header/>
        <div className="flex w-screen ">
            <Aside/>
            <main className="w-full ml-24 px-20 py-24  flex flex-col items-center ">
                {children}
            </main>
        </div>
        </>
    )
}