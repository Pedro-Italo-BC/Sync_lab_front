'use client';

import { useState } from "react";
import { ReserveResource } from "@/ui/reserves/ReserveResource";
import { MyReservations } from "@/ui/reserves/MyReservations";


type Tab = 'reservas' | 'agendar';

export default function DashboardPage() {
    const [activeTab, setActiveTab] = useState<Tab>('agendar');

    return (
        <div className="flex w-full h-screen">
            
            {activeTab === 'agendar' ? (
                <ReserveResource setActiveTab={setActiveTab} />
            ) : (
                <MyReservations setActiveTab={setActiveTab} />
            )}
        </div>
    );
}