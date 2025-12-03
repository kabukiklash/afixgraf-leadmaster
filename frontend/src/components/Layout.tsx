import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, MessageSquare, LayoutDashboard } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const { signOut, user } = useAuth();
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <div className="w-64 bg-white shadow-md flex flex-col">
                <div className="p-6 border-b">
                    <h1 className="text-xl font-bold text-blue-600">Afixgraf</h1>
                    <p className="text-sm text-gray-500">Lead Master</p>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <Link
                        to="/leads"
                        className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${isActive('/leads') ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        <MessageSquare size={20} />
                        <span>Atendimento</span>
                    </Link>
                    <Link
                        to="/admin"
                        className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${isActive('/admin') ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        <LayoutDashboard size={20} />
                        <span>Dashboard</span>
                    </Link>
                </nav>

                <div className="p-4 border-t bg-gray-50">
                    <div className="mb-4">
                        <p className="text-sm font-medium text-gray-900">{user?.nome}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    <button
                        onClick={signOut}
                        className="flex items-center space-x-2 text-red-600 hover:text-red-700 text-sm w-full"
                    >
                        <LogOut size={16} />
                        <span>Sair</span>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-hidden">
                {children}
            </div>
        </div>
    );
};

export default Layout;
