'use client'

import * as React from "react";
import { Controller, Control } from "react-hook-form";
import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";

type SelectInputProps = {
  control: Control<any>; // pode ser tipado com seu schema
  name: string;
  options?: string[],
  label: string,
  labelColor?:string
};

export function SelectInput({ control, name, options, label }: SelectInputProps) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <Box sx={{ minWidth: 120 }}>
          <FormControl fullWidth variant="standard">
            <InputLabel id={`${name}-label`}>{label}</InputLabel>
            <Select
              labelId={`${name}-label`}
              id={name}
              value={field.value || ""}
              onChange={field.onChange}
            >
              {options?.map((e) => {

                return <MenuItem value={e}>{e}</MenuItem>
              })}
            </Select>
          </FormControl>
        </Box>
      )}
    />
  );
}
