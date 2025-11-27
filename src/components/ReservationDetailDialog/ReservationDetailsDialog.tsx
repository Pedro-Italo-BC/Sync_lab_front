import {
  Dialog,
  Box,
  Typography,
  IconButton,
  Slide,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import CloseOutlinedIcon from '@mui/icons-material/Close';
import ImageNotSupportedIcon from '@mui/icons-material/ImageNotSupported';

export function ReservationDetailsDialog({ open, reservation, onClose, approve, reject }: any) {
  if (!reservation) return null;

  const imageLoaded = !!reservation.imageUrl;

  console.log(reservation)

  return (
    <Dialog
      open={open}
      onClose={onClose}
      TransitionComponent={Slide}
      keepMounted
      sx={{
        '& .MuiBackdrop-root': {
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
        },
      }}
      PaperProps={{
        sx: {
          maxWidth: 800,
          width: '100%',
          margin: 'auto',
          borderRadius: 4,
          backgroundColor: '#fff',
          color: '#000',
        },
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center" px={4} pt={4}>
        <Typography variant="h6">Detalhes do Agendamento</Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Box px={4} py={2} display="flex" flexDirection="column" gap={4}>
        <Box
          sx={{
            width: '100%',
            height: 240,
            backgroundColor: '#f3f3f3',
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {imageLoaded ? (
            <img
              src={reservation.imageUrl}
              alt="Recurso"
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }}
            />
          ) : (
            <ImageNotSupportedIcon sx={{ fontSize: 48, color: '#9ca3af' }} />
          )}
        </Box>

        <Box>
          <Typography variant="subtitle1">Recurso</Typography>
          <Typography>Tipo: {reservation.resource_type}</Typography>
          <Typography>Propósito: {reservation.purpose}</Typography>
          <Typography>
            Horário: {new Date(reservation.start_time).toLocaleString()} → {new Date(reservation.end_time).toLocaleString()}
          </Typography>
          <Typography>Status: {reservation.status}</Typography>
        </Box>

        <Box display="flex" alignItems="center" gap={2}>
          <img src={reservation.user.avatar} className='w-10 h-10 rounded-full' />
          <Box>
            <Typography variant="subtitle1">Usuário</Typography>
            <Typography>Nome: {reservation.user.name}</Typography>
            <Typography>Email: {reservation.user.email}</Typography>
          </Box>
        </Box>

        {/* Botões visuais */}
        <Box display="flex" justifyContent="flex-end" gap={2}>
          <IconButton
            sx={{
              backgroundColor: '#6ee7b7',
              color: '#fff',
              borderRadius: 2,
              width: 48,
              height: 48,
            }}
            onClick={approve}
          >
            <CheckIcon />
          </IconButton>

          <IconButton
            sx={{
              backgroundColor: '#ef4444',
              color: '#fff',
              borderRadius: 2,
              width: 48,
              height: 48,
            }}
            onClick={reject}
          >
            <CloseOutlinedIcon />
          </IconButton>
        </Box>
      </Box>
    </Dialog>
  );
}