import Link from "next/link";
import { ReactNode } from "react";

type ActionButtonProps = {
    url: string
    children: ReactNode
    title: string
    size?: "small" | "big"
}

export function ActionButton({url,children, title, size = "small"}:ActionButtonProps) {
    return (
        <Link href={url} className={`flex flex-col justify-center items-center ${size == 'small' ? "w-36 h-36" : "w-52 h-52"} hover:bg-gradient-to-br hover:from-[var(--blue-100)] hover:to-[var(--cyan-100)] rounded-lg cursor-pointer duration-300 ease-in-out transition bg-white text-black hover:text-white`}>
            {children}
            <p className="justify-end font-medium">{title}</p>
        </Link>
    )
}