import {AutoAwesome} from '@mui/icons-material'

type ElegantButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    text: string
} 

export function ElegantButtom({text, ...props}:  ElegantButtonProps) {
    return (
        <button className="w-96 flex gap-2 h-14 justify-center items-center rounded-xl font-semibold text-white
         bg-[conic-gradient(at_top_right,_#7b5bff_0%,_#b85ac9_40%,_#5c8dff_80%,_#7b5bff_100%)]
         
        shadow-[0_4px_12px_rgba(0,0,0,0.25)]
        hover:shadow-[0_6px_16px_rgba(0,0,0,0.30)]
        hover:scale-[1.02]
        duration-300 
        cursor-pointer
         " {...props} >
            <AutoAwesome fontSize='medium'/>
            {text}
        </button>
    )
}