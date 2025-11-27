'use client'

import HomeFilledIcon from '@mui/icons-material/HomeFilled';
import EventIcon from '@mui/icons-material/Event';
import WatchLaterIcon from '@mui/icons-material/WatchLater';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import {getRole} from '../../utils/jwt-utils'

import { AsideButton } from "../AsideButton/AsideButton";

export function Aside() {
    return (
        <aside className="top-20 bg-[var(--foreground)] flex flex-col h-full w-24 border-r-1 border-r-[var(--gray-100)] fixed">
            <AsideButton href='/home' title='Home' value='home'> 
                <HomeFilledIcon fontSize='large'/>
            </AsideButton>
            <AsideButton href='/events' title='Eventos' value='events'> 
                <EventIcon  fontSize='large'/>
            </AsideButton>
            <AsideButton href='/reserves' title='Agendamentos' value='reserves'>  
                <WatchLaterIcon  fontSize='large'/>
            </AsideButton>
            {
                getRole() == "ADMIN" && <AsideButton href='/admin' title='Administração' value='admin'> 
                <AdminPanelSettingsIcon  fontSize='large'/>
                </AsideButton>
            }
            
        </aside>
    )
}