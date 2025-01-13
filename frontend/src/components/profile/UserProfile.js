import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Container, Typography, Paper, Button,
    Avatar, CssBaseline, Alert, CircularProgress
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { Link as RouterLink } from 'react-router-dom';
import { userService } from '../../api';
import { removeTokens } from '../../utils/auth';
import getLPTheme from '../../getLPTheme';

export default function UserProfile() {
    const [mode] = useState('dark');
    const [user, setUser] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const LPtheme = React.useMemo(() => createTheme(getLPTheme(mode)), [mode]);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userData = await userService.getCurrentUser();
                setUser(userData);
            } catch (error) {
                console.error('Error fetching user data:', error);
                setError(error.response?.data?.detail || 'Failed to load user data');
                if (error.response?.status === 401) {
                    navigate('/sign-in');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [navigate]);

    const handleLogout = () => {
        removeTokens();
        navigate('/');
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <ThemeProvider theme={LPtheme}>
            <CssBaseline />
            <Box sx={{
                bgcolor: 'background.default',
                color: 'text.primary',
                minHeight: '100vh',
                py: { xs: 4, sm: 12 },
            }}>
                <Container maxWidth="md">
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}
                    <Paper 
                        elevation={3}
                        sx={{
                            p: 4,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                        }}
                    >
                        <Typography variant="h4" gutterBottom>
                            Профиль пользователя
                        </Typography>
                        <Avatar sx={{ m: 1, bgcolor: 'secondary.main', width: 80, height: 80 }}>
                            {user?.username.charAt(0).toUpperCase()}
                        </Avatar>
                        <Typography variant="h5" gutterBottom>
                            {user?.username}
                        </Typography>
                        <Typography variant="body1" color="text.secondary" gutterBottom>
                            Email: {user?.email}
                        </Typography>
                        <Typography variant="body1" color="text.secondary" gutterBottom>
                            Роль: {user?.role}
                        </Typography>
                        <Button
                            startIcon={<LockOutlinedIcon />}
                            variant="outlined"
                            sx={{ mt: 2, mb: 2 }}
                        >
                            Изменить пароль
                        </Button>
                        {user?.role === 'admin' && (
                            <Button
                                component={RouterLink}
                                to="/admin"
                                startIcon={<AdminPanelSettingsIcon />}
                                variant="contained"
                                color="primary"
                                sx={{ mb: 2 }}
                            >
                                Панель администратора
                            </Button>
                        )}
                        <Button
                            variant="contained"
                            color="secondary"
                            onClick={handleLogout}
                        >
                            Выйти
                        </Button>
                    </Paper>
                </Container>
            </Box>
        </ThemeProvider>
    );
}