import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import ChatWindow from '../components/ChatWindow';
import api from '../services/api';
import { Search, User } from 'lucide-react';

interface Lead {
    id: number;
    telefone: string;
    nomewpp: string;
    atendimento_ia: boolean | string;
    responsavel_atual: string;
    updated_at: string;
}

const LeadsList: React.FC = () => {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [search, setSearch] = useState('');
    const [page] = useState(1);
    const [loading, setLoading] = useState(false);

    const fetchLeads = async () => {
        setLoading(true);
        try {
            const response = await api.get('/leads', {
                params: { page, search }
            });
            setLeads(response.data.data);
        } catch (error) {
            console.error('Erro ao buscar leads', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeads();
    }, [page, search]);

    const handleLeadClick = (lead: Lead) => {
        setSelectedLead(lead);
    };

    const handleActionComplete = () => {
        fetchLeads(); // Recarregar lista para atualizar status
    };

    return (
        <Layout>
            <div className="flex h-full">
                {/* List Panel */}
                <div className={`${selectedLead ? 'hidden md:flex' : 'flex'} w-full md:w-1/3 flex-col border-r bg-white`}>
                    <div className="p-4 border-b">
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Buscar por nome ou telefone..."
                                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {loading ? (
                            <div className="p-4 text-center text-gray-500">Carregando...</div>
                        ) : (
                            leads.map((lead) => (
                                <div
                                    key={lead.id}
                                    onClick={() => handleLeadClick(lead)}
                                    className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${selectedLead?.id === lead.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''}`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="font-semibold text-gray-800">{lead.nomewpp || 'Sem Nome'}</h3>
                                        <span className="text-xs text-gray-500">{new Date(lead.updated_at).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-2">{lead.telefone}</p>
                                    <div className="flex items-center justify-between">
                                        <span className={`text-xs px-2 py-1 rounded-full ${lead.atendimento_ia === true ? 'bg-green-100 text-green-800' :
                                            lead.atendimento_ia === 'pause' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-blue-100 text-blue-800'
                                            }`}>
                                            {lead.atendimento_ia === true ? 'IA Ativa' :
                                                lead.atendimento_ia === 'pause' ? 'Pausado' : 'Humano'}
                                        </span>
                                        {lead.responsavel_atual && (
                                            <div className="flex items-center text-xs text-gray-500">
                                                <User size={12} className="mr-1" />
                                                {lead.responsavel_atual}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Chat Panel */}
                <div className={`${selectedLead ? 'flex' : 'hidden md:flex'} flex-1 bg-gray-50 flex-col`}>
                    {selectedLead ? (
                        <ChatWindow
                            leadPhone={selectedLead.telefone}
                            leadName={selectedLead.nomewpp}
                            onActionComplete={handleActionComplete}
                        />
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-gray-400">
                            <div className="text-center">
                                <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
                                <p>Selecione um lead para iniciar o atendimento</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

import { MessageSquare } from 'lucide-react'; // Import missing icon
export default LeadsList;
