import { ReactNode } from "react";

type LabelProps =  React.HTMLAttributes<HTMLElement> & {
    title: string;
    children: ReactNode;
    gap?: string
}

export function Label({children, title,gap, ...props}: LabelProps) {
    return (
        <section className="w-full mb-10" {...props}>
            <h2 className="font-bold text-3xl mb-2">{title}</h2>
            <div className={`flex gap-y-2 flex-wrap h-full ${gap ? gap : 'gap-x-17'}`}>
                {children}
            </div>
        </section>
    ) 
}