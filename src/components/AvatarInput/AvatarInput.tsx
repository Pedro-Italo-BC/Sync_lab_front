import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import ButtonBase from '@mui/material/ButtonBase';
import { AddAPhoto } from '@mui/icons-material';

type AvatarInputProps = {
  onFileSelect?: (file: File) => void; // callback para o pai
};

export function AvatarInput({ onFileSelect }: AvatarInputProps) {
  const [avatarSrc, setAvatarSrc] = React.useState<string | undefined>(undefined);

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setAvatarSrc(reader.result as string);
    reader.readAsDataURL(file);

    if (onFileSelect) {
      onFileSelect(file);
    }
  };

  return (
    <ButtonBase
      component="label"
      role={undefined}
      tabIndex={-1}
      aria-label="Avatar image"
      className="hover:brightness-90 duration-300 transition"
      sx={{
        borderRadius: '50%',
        background: '#fff',
        width: '5rem',
        height: '5rem',
        position: 'absolute',
        top: '50%',
        left: '10%',
        boxShadow: '0px 4px 4px -3px #000',
      }}
    >
      {avatarSrc ? (
        <Avatar
          alt="Avatar preview"
          src={avatarSrc}
          sx={{ width: '100%', height: '100%' }}
        />
      ) : (
        <AddAPhoto />
      )}

      <input
        type="file"
        accept="image/*"
        style={{
          border: 0,
          clip: 'rect(0 0 0 0)',
          height: '1px',
          margin: '-1px',
          padding: 0,
          position: 'absolute',
          whiteSpace: 'nowrap',
          width: '1px',
        }}
        onChange={handleAvatarChange}
      />
    </ButtonBase>
  );
}
