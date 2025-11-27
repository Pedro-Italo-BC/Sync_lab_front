'use client'

import { Label } from "@/components/Label/Label"
import { ActionButton } from "@/components/ActionButton/ActionButton"
import { PersonAdd, Person, History, Build, Domain, Book, WorkspacePremium,  } from '@mui/icons-material'

export default function Admin() {
  return (
    <div className="flex flex-col w-full px-6 py-8">
      <Label title="Gerenciamento" gap="gap-4" className="w-full">
        <p className="text-[var(--gray-200)] text-sm mb-6 text-center">
          Escolha uma das opções abaixo para administrar o sistema.
        </p>

        <div className="w-full max-w-5xl mx-auto bg-[var(--foreground)] rounded-xl shadow-md p-8">
          <div className="flex justify-center items-center gap-6 flex-wrap *:shadow">
            <ActionButton title="Cadastrar Pessoa" url="/admin/register-person" size="big">
              <PersonAdd fontSize="large"  />
            </ActionButton>
            <ActionButton title="Gerenciar Pessoas" url="/admin/manage-person" size="big">
              <Person fontSize="large"  />
            </ActionButton>
            <ActionButton title="Agendamentos" url="/admin/manage-reservations" size="big">
              <History fontSize="large"  />
            </ActionButton>
            <ActionButton title="Gerenciar Recursos" url="/admin/register-other" size="big">
              <Build fontSize="large"  />
            </ActionButton>
            <ActionButton title="Gerenciar Prédios" url="/admin/manage-building" size="big">
              <Domain fontSize="large"  />
            </ActionButton>
             <ActionButton title="Gerenciar Aulas" url="/admin/manage-lectures" size="big">
              <Book fontSize="large"  />
            </ActionButton>
            <ActionButton title="Gerenciar Curso" url="/admin/register-course" size="big">
              <WorkspacePremium fontSize="large"  />
            </ActionButton>
          </div>
        </div>
      </Label>
    </div>
  )
}