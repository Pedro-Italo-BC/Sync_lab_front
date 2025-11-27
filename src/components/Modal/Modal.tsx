import { ReactNode } from "react"

interface ModalProps {
    title: string
    children: ReactNode
    handleClose: () => void
}

export function Modal({ title, children, handleClose }: ModalProps) {
    return (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-lg w-4/5 h-4/5 p-6 relative">
                <button
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 cursor-pointer"
                    onClick={handleClose}
                >✕</button>
                <h2 className="text-xl font-bold mb-4">
                    {title}
                </h2>

                <div className="flex w-full gap-6 h-full overflow-x-auto flex-nowrap p-2">
                    {children}
                </div>
            </div>
        </div>
    )
}