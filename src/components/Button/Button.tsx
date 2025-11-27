'use client'

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    buttonStyle: "PRIMARY" | "SECONDARY",
    title: string,
    handleButton?: (e: React.MouseEvent<HTMLButtonElement>) => void
    size?: "sm" | "nm" | 'lg'
}

export function Button({type, title, handleButton, size = 'lg', ...props}: ButtonProps) {
    return (
        <button className={`w-full rounded-lg text-white font-semibold  bg-gradient-to-br from-[var(--blue-100)] to-[var(--cyan-100)] shadow-lg transition duration-300 ease-in-out hover:shadow-xl hover:brightness-110 cursor-pointer disabled:cursor-not-allowed disabled:brightness-50 ${size == 'lg' ? "h-16 text-2xl": "h-10 text-[1.25rem]"}`} {...props} onClick={handleButton}>
            <h2 className="text-[var(--foreground)]">{title}</h2>
        </button>
    )
}