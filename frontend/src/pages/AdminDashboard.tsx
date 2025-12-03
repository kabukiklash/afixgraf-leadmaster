import React from 'react';
import Layout from '../components/Layout';
import { Users, MessageCircle, Clock, TrendingUp } from 'lucide-react';

const AdminDashboard: React.FC = () => {
    return (
        <Layout>
            <div className="p-8">
                <h1 className="text-2xl font-bold mb-6 text-gray-800">Dashboard Administrativo</h1>

                {/* Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-gray-500 text-sm font-medium">Total de Leads</h3>
                            <Users className="text-blue-500" size={20} />
                        </div>
                        <p className="text-3xl font-bold text-gray-800">1,234</p>
                        <span className="text-green-500 text-xs font-medium">+12% este mês</span>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-gray-500 text-sm font-medium">Atendimentos Ativos</h3>
                            <MessageCircle className="text-green-500" size={20} />
                        </div>
                        <p className="text-3xl font-bold text-gray-800">56</p>
                        <span className="text-gray-400 text-xs font-medium">Agora</span>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-gray-500 text-sm font-medium">Tempo Médio Resp.</h3>
                            <Clock className="text-yellow-500" size={20} />
                        </div>
                        <p className="text-3xl font-bold text-gray-800">5m 30s</p>
                        <span className="text-red-500 text-xs font-medium">+30s vs ontem</span>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-gray-500 text-sm font-medium">Conversão</h3>
                            <TrendingUp className="text-purple-500" size={20} />
                        </div>
                        <p className="text-3xl font-bold text-gray-800">3.2%</p>
                        <span className="text-green-500 text-xs font-medium">+0.5% este mês</span>
                    </div>
                </div>

                {/* Placeholder Charts Area */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm border h-64 flex items-center justify-center bg-gray-50">
                        <p className="text-gray-400">Gráfico de Leads por Status (Placeholder)</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm border h-64 flex items-center justify-center bg-gray-50">
                        <p className="text-gray-400">Gráfico de Volume de Mensagens (Placeholder)</p>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default AdminDashboard;
