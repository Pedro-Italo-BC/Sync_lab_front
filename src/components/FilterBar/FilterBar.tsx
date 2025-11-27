import { Input } from "@/components/Input/Input";
import { SelectInput } from "@/components/Input/SelectInput";
import SearchIcon from "@mui/icons-material/Search";
import { Control, FieldValues, RegisterOptions, UseFormRegister } from "react-hook-form";

type FilterBar = {
  field_1?: { name: string, values: string[] }
  field_2?: { name: string, values: string[] }
  searchLabel: string,
  control: Control<any>
  register: UseFormRegister<FieldValues>
}

export function FilterBar({ control, register, field_1, field_2, searchLabel }: FilterBar) {
  return (
    <div className="flex gap-4 mb-6 items-end">
      {
        field_1 && (<SelectInput
          control={control}
          label={field_1.name}
          options={field_1.values}
          name={field_1.name}
          labelColor="black"
        />)
      }

      {
        field_2 && (<SelectInput
          control={control}
          label={field_2.name}
          options={field_2.values}
          name={field_2.name}
          labelColor="black"
        />)
      }
      <div className="relative w-full">
        <Input
          className="w-full pr-10 "
          placeholder={searchLabel}
          {...register("search")}
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black cursor-pointer"
        >
          <SearchIcon />
        </button>
      </div>

    </div>
  );
}