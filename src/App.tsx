import React from 'react';
import { Routes, Route, useLocation, NavLink, useNavigate } from 'react-router-dom';
import { useData } from './context/DataContext';
import Dashboard from './components/Dashboard';
import Fleet from './components/Fleet';
import Rentals from './components/Rentals';
import CalendarView from './components/CalendarView';
import Settings from './components/Settings';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import CustomerFormPublic from './components/CustomerFormPublic';
import { Button } from './components/ui';
import { LayoutDashboard, Car, FileText, Calendar, Settings as SettingsIcon, LogOutIcon } from './components/Icons';


const NavItem: React.FC<{ to: string; icon: React.ReactNode; children: React.ReactNode }> = ({ to, icon, children }) => (
    <NavLink
        to={to}
        end
        className={({ isActive }) =>
            `flex items-center px-4 py-2 rounded-lg transition-colors text-text-secondary hover:bg-gray-700 hover:text-text-primary ${
            isActive ? 'bg-primary text-white' : ''
            }`
        }
    >
        <span className="mr-3">{icon}</span>
        {children}
    </NavLink>
);


const Sidebar: React.FC = () => {
    const { logout } = useData();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <aside className="w-64 bg-surface flex flex-col p-4 border-r border-gray-700">
            <div className="text-2xl font-bold mb-8 text-center">
                Rental<span className="text-accent">Manager</span>
            </div>
            <nav className="flex flex-col space-y-2 flex-1">
                <NavItem to="/" icon={<LayoutDashboard className="w-5 h-5" />}>Přehled</NavItem>
                <NavItem to="/fleet" icon={<Car className="w-5 h-5" />}>Vozový park</NavItem>
                <NavItem to="/rentals" icon={<FileText className="w-5 h-5" />}>Pronájmy</NavItem>
                <NavItem to="/calendar" icon={<Calendar className="w-5 h-5" />}>Kalendář</NavItem>
                <NavItem to="/settings" icon={<SettingsIcon className="w-5 h-5" />}>Nastavení</NavItem>
            </nav>
            <Button onClick={handleLogout} variant="secondary" className="w-full">
                <LogOutIcon className="w-5 h-5 mr-2" />
                Odhlásit se
            </Button>
        </aside>
    );
};


const App: React.FC = () => {
    const { isAuthenticated } = useData();
    const location = useLocation();

    // Don't show sidebar on login or public form pages
    const showSidebar = isAuthenticated && !['/login', '/new-request'].includes(location.pathname);

    return (
        <div className="flex h-screen bg-background text-text-primary font-sans">
            {showSidebar && <Sidebar />}
            <main className="flex-1 overflow-y-auto">
                <div className="p-8">
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/new-request" element={<CustomerFormPublic />} />
                        
                        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                        <Route path="/fleet" element={<ProtectedRoute><Fleet /></ProtectedRoute>} />
                        <Route path="/rentals" element={<ProtectedRoute><Rentals /></ProtectedRoute>} />
                        <Route path="/calendar" element={<ProtectedRoute><CalendarView /></ProtectedRoute>} />
                        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                    </Routes>
                </div>
            </main>
        </div>
    );
};

export default App;
