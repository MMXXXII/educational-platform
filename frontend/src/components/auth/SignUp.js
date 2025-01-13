import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Avatar, Button, TextField, FormControlLabel,
    Checkbox, Link, Grid, Box, Typography,
    Container, CssBaseline, Alert
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { userService } from '../../api';
import getLPTheme from '../../getLPTheme';
function Copyright() {
    return (
        <Typography variant="body2" color="text.secondary" mt={1}>
            {'Copyright © '}
            <Link color="inherit" href="https://mui.com/">МегаГеймдев&nbsp;</Link>
            {new Date().getFullYear()}
        </Typography>
    );
}

export default function SignUp() {
    const [mode] = React.useState('dark');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const LPtheme = React.useMemo(() => createTheme(getLPTheme(mode)), [mode]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        const data = new FormData(event.currentTarget);
        
        try {
            await userService.createUser({
                username: data.get('username'),
                email: data.get('email'),
                password: data.get('password')
            });
            navigate('/sign-in');
        } catch (error) {
            console.error('Error:', error);
            setError(error.response?.data?.detail || 'Registration failed');
        }
    };

    return (
        <ThemeProvider theme={LPtheme}>
            <Box sx={{
                bgcolor: 'background.default',
                color: 'text.primary',
                minHeight: '100vh',
                py: { xs: 4, sm: 12 },
            }}>
                <Container component="main" maxWidth="xs">
                    <CssBaseline />
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}>
                        <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                            <LockOutlinedIcon />
                        </Avatar>
                        <Typography component="h1" variant="h4" gutterBottom>
                            Регистрация
                        </Typography>
                        {error && (
                            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
                                {error}
                            </Alert>
                        )}
                        <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <TextField
                                        autoComplete="username"
                                        name="username"
                                        required
                                        fullWidth
                                        id="username"
                                        label="Никнейм"
                                        autoFocus
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        required
                                        fullWidth
                                        id="email"
                                        label="Электронная почта"
                                        name="email"
                                        autoComplete="email"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        required
                                        fullWidth
                                        name="password"
                                        label="Пароль"
                                        type="password"
                                        id="password"
                                        autoComplete="new-password"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <FormControlLabel
                                        control={<Checkbox value="allowExtraEmails" color="primary" />}
                                        label="Я хочу получать новости об обновлениях на электронную почту."
                                    />
                                </Grid>
                            </Grid>
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                sx={{ mt: 3, mb: 2 }}
                            >
                                Зарегистрироваться
                            </Button>
                            <Grid container justifyContent="flex-end">
                                <Grid item>
                                    <Link href="/sign-in" variant="body2">
                                        Уже есть аккаунт? Войти
                                    </Link>
                                </Grid>
                            </Grid>
                        </Box>
                    </Box>
                    <Copyright sx={{ mt: 5 }} />
                </Container>
            </Box>
        </ThemeProvider>
    );
}