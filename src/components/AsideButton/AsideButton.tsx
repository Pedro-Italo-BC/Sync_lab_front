'use client'

import { ReactNode } from "react";
import { usePathname } from 'next/navigation';
import Link from "next/link";

type AsideButton = {
    href: string;
    children: ReactNode
    title: string,
    value: string
}

export function AsideButton({title, children, href, value}: AsideButton) {
    const pathname = usePathname();
    const firstPathSegment = pathname.split('/')[1] == value;

    return (
        <a href={href} className={`h-24 w-full flex flex-col items-center justify-center ${firstPathSegment ? "text-white" : "text-black"} ${firstPathSegment ? "bg-[var(--blue-50)]" : "bg-white"} hover:brightness-90 transition-all duration-300`}>
            {children}
            <p className="text-[0.8rem] font-medium">{title}</p>
        </a>
    )
}