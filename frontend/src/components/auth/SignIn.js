import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Avatar, Button, TextField, FormControlLabel,
    Checkbox, Link, Grid, Box, Typography,
    Container, CssBaseline, Alert
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { authService, userService } from '../../api';
import { setTokens } from '../../utils/auth';
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

export default function SignIn() {
    const [mode] = React.useState('dark');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const LPtheme = React.useMemo(() => createTheme(getLPTheme(mode)), [mode]);

    const from = location.state?.from?.pathname || '/';

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        const data = new FormData(event.currentTarget);
        
        try {
            // Authentication
            const authData = await authService.login(
                data.get('email'),
                data.get('password')
            );
            setTokens(authData.access_token, authData.refresh_token);

            // Get user data
            const userData = await userService.getCurrentUser();
            localStorage.setItem('user', JSON.stringify(userData));

            navigate(from, { replace: true });
        } catch (error) {
            console.error('Error:', error);
            setError(error.response?.data?.detail || 'Authentication failed');
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
                            Вход
                        </Typography>
                        {error && (
                            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
                                {error}
                            </Alert>
                        )}
                        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="email"
                                label="Электронная почта"
                                name="email"
                                autoComplete="email"
                                autoFocus
                            />
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                name="password"
                                label="Пароль"
                                type="password"
                                id="password"
                                autoComplete="current-password"
                            />
                            <FormControlLabel
                                control={<Checkbox value="remember" color="primary" />}
                                label="Запомнить меня"
                            />
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                sx={{ mt: 3, mb: 2 }}
                            >
                                Войти
                            </Button>
                            <Grid container>
                                <Grid item xs>
                                    <Link href="#" variant="body2">
                                        Забыли пароль?
                                    </Link>
                                </Grid>
                                <Grid item>
                                    <Link href="/sign-up" variant="body2">
                                        {"Нет аккаунта? Зарегистрироваться"}
                                    </Link>
                                </Grid>
                            </Grid>
                        </Box>
                    </Box>
                    <Copyright sx={{ mt: 8, mb: 4 }} />
                </Container>
            </Box>
        </ThemeProvider>
    );
}