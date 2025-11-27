'use client'

import SearchIcon from '@mui/icons-material/Search';

export function SearchBar() {
 
    return (
        <div className='h-11 flex bg-[var(--background)] px-3 rounded-lg items-center w-1/3 border-2 border-[var(--background)] focus-within:border-[var(--blue-100)] duration-300 transition'>
            <input placeholder='Pesquise novos enventos' className="placeholder-[var(--gray-200)] w-full focus:outline-none text-black placeholder:text-[1rem] border-r-2 border-r-[#c4c4c4] h-8 font-medium placeholder:font-medium" type="text" />
           <button className="w-24 h-full flex justify-center items-center cursor-pointer transition duration-300 text-black hover:text-[var(--blue-100)]">
                <SearchIcon/>
            </button>
        </div>
    )
}