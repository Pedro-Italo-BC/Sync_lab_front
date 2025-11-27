import Image from 'next/image'
import SyncLabLogo from '../../../public/Logo.png'
import { SearchBar } from '../SearchBar/SearchBar'
import { Avatar } from '../Avatar/Avatar'
import Link from 'next/link'
import Notifications from "@/components/Notifications/Notifications";


export function Header() {
    return (
        <header className='w-full h-20 flex items-center justify-between px-8 bg-[var(--foreground)] border-b border-b-[var(--gray-100)] fixed z-50'>
            <Link href="/home">
                <Image src={SyncLabLogo} alt='' width={150}/>
            </Link>

            <div className="flex items-center gap-5">
                <Notifications/>
                <Avatar/>
            </div>
        </header>
    )
}