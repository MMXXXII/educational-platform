import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import {
    Box, Container, Typography, Drawer, List,
    ListItemButton, ListItemIcon, ListItemText, AppBar,
    Toolbar, IconButton, CssBaseline, CircularProgress,
    Alert
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import FolderIcon from '@mui/icons-material/Folder';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { userService } from '../../api';
import getLPTheme from '../../getLPTheme';
import FileManager from '../fileManager/FileManager';

const drawerWidth = 240;

export default function AdminPanel() {
    const [mode] = useState('dark');
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [mobileOpen, setMobileOpen] = useState(false);
    const [selectedTab, setSelectedTab] = useState('dashboard');
    const navigate = useNavigate();
    const LPtheme = React.useMemo(() => createTheme(getLPTheme(mode)), [mode]);

    useEffect(() => {
        const checkAdminStatus = async () => {
            try {
                const userData = await userService.getCurrentUser();
                if (userData.role === 'admin') {
                    setIsAdmin(true);
                } else {
                    navigate('/profile');
                }
            } catch (error) {
                console.error('Error checking admin status:', error);
                setError(error.response?.data?.detail || 'Доступ запрещен');
                if (error.response?.status === 401) {
                    navigate('/sign-in');
                }
            } finally {
                setLoading(false);
            }
        };

        checkAdminStatus();
    }, [navigate]);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleTabClick = (tabName) => {
        setSelectedTab(tabName);
        setMobileOpen(false);
    };

    const drawer = (
        <div>
            <Toolbar />
            <List>
                {[
                    { text: 'Панель управления', icon: <DashboardIcon />, key: 'dashboard' },
                    { text: 'Файловый менеджер', icon: <FolderIcon />, key: 'file-manager' },
                    { text: 'Пользователи', icon: <PeopleIcon />, key: 'users' },
                    { text: 'Настройки', icon: <SettingsIcon />, key: 'settings' },
                ].map((item) => (
                    <ListItemButton
                        key={item.text}
                        onClick={() => handleTabClick(item.key)}
                        selected={selectedTab === item.key}
                    >
                        <ListItemIcon>{item.icon}</ListItemIcon>
                        <ListItemText primary={item.text} />
                    </ListItemButton>
                ))}
            </List>
        </div>
    );

    const renderContent = () => {
        switch (selectedTab) {
            case 'dashboard':
                return <Typography>Содержимое панели управления</Typography>;
            case 'file-manager':
                return <FileManager />;
            case 'users':
                return <Typography>Управление пользователями</Typography>;
            case 'settings':
                return <Typography>Настройки администратора</Typography>;
            default:
                return <Typography>Выберите вкладку</Typography>;
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!isAdmin) {
        return null;
    }

    return (
        <ThemeProvider theme={LPtheme}>
            <CssBaseline />
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
                <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                    <Toolbar>
                        <IconButton
                            color="inherit"
                            aria-label="открыть меню"
                            edge="start"
                            onClick={handleDrawerToggle}
                            sx={{ mr: 2, display: { sm: 'none' } }}
                        >
                            <MenuIcon />
                        </IconButton>
                        <IconButton
                            color="inherit"
                            onClick={() => navigate('/')}
                        >
                            <ArrowBackIcon />
                        </IconButton>
                        <Typography variant="h6" noWrap component="div">
                            Панель администратора
                        </Typography>
                    </Toolbar>
                </AppBar>

                {error && (
                    <Alert severity="error" sx={{ mt: 8 }}>
                        {error}
                    </Alert>
                )}

                <Box sx={{ display: 'flex', flexGrow: 1 }}>
                    <Box
                        component="nav"
                        sx={{
                            width: { sm: drawerWidth },
                            flexShrink: { sm: 0 },
                        }}
                    >
                        <Drawer
                            variant="temporary"
                            open={mobileOpen}
                            onClose={handleDrawerToggle}
                            ModalProps={{ keepMounted: true }}
                            sx={{
                                display: { xs: 'block', sm: 'none' },
                                '& .MuiDrawer-paper': {
                                    boxSizing: 'border-box',
                                    width: drawerWidth,
                                },
                            }}
                        >
                            {drawer}
                        </Drawer>
                        <Drawer
                            variant="permanent"
                            sx={{
                                display: { xs: 'none', sm: 'block' },
                                '& .MuiDrawer-paper': {
                                    boxSizing: 'border-box',
                                    width: drawerWidth,
                                },
                            }}
                            open
                        >
                            {drawer}
                        </Drawer>
                    </Box>
                    <Box
                        component="main"
                        sx={{
                            flexGrow: 1,
                            p: 3,
                            width: { sm: `calc(100% - ${drawerWidth}px)` },
                            mt: '64px',
                        }}
                    >
                        {renderContent()}
                    </Box>
                </Box>
            </Box>
        </ThemeProvider>
    );
}