import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  FormControlLabel,
  Checkbox,
  Box
} from '@mui/material';

export const CreateFolderDialog = ({ open, onClose, onCreate, value, onChange }) => (
  <Dialog open={open} onClose={onClose}>
    <DialogTitle>Создание новой папки</DialogTitle>
    <DialogContent>
      <TextField
        autoFocus
        margin="dense"
        label="Имя папки"
        fullWidth
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Отмена</Button>
      <Button onClick={onCreate}>Создать</Button>
    </DialogActions>
  </Dialog>
);

export const RenameDialog = ({ open, onClose, onRename, value, onChange }) => (
  <Dialog open={open} onClose={onClose}>
    <DialogTitle>Переименование</DialogTitle>
    <DialogContent>
      <TextField
        autoFocus
        margin="dense"
        label="Новое имя"
        fullWidth
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Отмена</Button>
      <Button onClick={onRename}>Переименовать</Button>
    </DialogActions>
  </Dialog>
);

export const DeleteDialog = ({ 
  open, 
  onClose, 
  onDelete, 
  item,
  dontAskAgain,
  onDontAskAgainChange 
}) => (
  <Dialog open={open} onClose={onClose}>
    <DialogTitle>Подтверждение удаления</DialogTitle>
    <DialogContent>
      <Typography variant="body1" gutterBottom>
        Вы уверены, что хотите удалить {item?.is_folder ? 'папку' : 'файл'} "{item?.name}"?
      </Typography>
      {item?.is_folder && (
        <Typography color="error" variant="body2" sx={{ mt: 1 }}>
          Это также удалит все содержимое папки.
        </Typography>
      )}
      <Box sx={{ mt: 2 }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={dontAskAgain}
              onChange={(e) => onDontAskAgainChange(e.target.checked)}
            />
          }
          label="Больше не спрашивать"
        />
      </Box>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Отмена</Button>
      <Button onClick={onDelete} color="error" variant="contained">
        Удалить
      </Button>
    </DialogActions>
  </Dialog>
);