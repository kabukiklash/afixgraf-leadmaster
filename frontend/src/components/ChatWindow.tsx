import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { Send, Play, Pause, RefreshCw } from 'lucide-react';

interface Message {
    id: string;
    agent_type: string;
    agent_name?: string;
    message: string;
    created_at: string;
    event?: string;
}

interface ChatWindowProps {
    leadPhone: string;
    leadName: string;
    onActionComplete: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ leadPhone, leadName, onActionComplete }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const fetchMessages = async () => {
        try {
            const response = await api.get(`/leads/${leadPhone}/messages`);
            setMessages(response.data);
            scrollToBottom();
        } catch (error) {
            console.error('Erro ao buscar mensagens', error);
        }
    };

    useEffect(() => {
        if (leadPhone) {
            fetchMessages();
            // Polling simples para atualização (ideal seria websocket)
            const interval = setInterval(fetchMessages, 5000);
            return () => clearInterval(interval);
        }
    }, [leadPhone]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            setLoading(true);
            await api.post('/enviar-mensagem', {
                telefone: leadPhone,
                mensagem: newMessage
            });
            setNewMessage('');
            fetchMessages();
        } catch (error) {
            console.error('Erro ao enviar mensagem', error);
            alert('Erro ao enviar mensagem');
        } finally {
            setLoading(false);
        }
    };

    const handleAssume = async () => {
        try {
            await api.post('/assumir-atendimento', { telefone: leadPhone });
            onActionComplete();
            fetchMessages();
        } catch (error) {
            console.error('Erro ao assumir', error);
        }
    };

    const handlePause = async () => {
        try {
            await api.post('/pausar-atendimento', { telefone: leadPhone });
            onActionComplete();
            fetchMessages();
        } catch (error) {
            console.error('Erro ao pausar', error);
        }
    };

    const handleReactivate = async () => {
        try {
            await api.post('/reativar-atendimento', { telefone: leadPhone });
            onActionComplete();
            fetchMessages();
        } catch (error) {
            console.error('Erro ao reativar', error);
        }
    };

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Header */}
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                <div>
                    <h2 className="font-bold text-lg">{leadName || leadPhone}</h2>
                    <p className="text-sm text-gray-500">{leadPhone}</p>
                </div>
                <div className="flex space-x-2">
                    <button onClick={handleAssume} className="p-2 text-blue-600 hover:bg-blue-100 rounded" title="Assumir">
                        <Play size={20} />
                    </button>
                    <button onClick={handlePause} className="p-2 text-yellow-600 hover:bg-yellow-100 rounded" title="Pausar">
                        <Pause size={20} />
                    </button>
                    <button onClick={handleReactivate} className="p-2 text-green-600 hover:bg-green-100 rounded" title="Reativar IA">
                        <RefreshCw size={20} />
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-100">
                {messages.map((msg, index) => {
                    const isSystem = msg.agent_type === 'system';
                    const isHuman = msg.agent_type === 'human';
                    // Assumindo que mensagens do cliente viriam com outro agent_type ou identificadas de outra forma
                    // Se o backend não distinguir cliente de atendente claramente, precisaremos ajustar.
                    // Por enquanto: human = atendente, system = sistema. E o cliente?
                    // O prompt diz: agent_type, agent_name, message.
                    // Vou assumir que se não for human nem system, é o cliente.
                    // Ou verificar se o backend salva 'client' ou 'user'.
                    // Olhando o backend antigo, parece que só salva o que enviamos.
                    // O webhook do n8n deve salvar as do cliente.
                    // Vou assumir um padrão visual genérico.

                    const isMe = isHuman;

                    if (isSystem) {
                        return (
                            <div key={index} className="flex justify-center my-2">
                                <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                                    {msg.event ? `Evento: ${msg.event}` : msg.message}
                                </span>
                            </div>
                        );
                    }

                    return (
                        <div key={index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[70%] rounded-lg p-3 ${isMe ? 'bg-blue-500 text-white' : 'bg-white border text-gray-800'}`}>
                                {!isMe && <p className="text-xs font-bold mb-1">{msg.agent_name || 'Cliente'}</p>}
                                <p>{msg.message}</p>
                                <p className={`text-[10px] mt-1 ${isMe ? 'text-blue-100' : 'text-gray-400'}`}>
                                    {new Date(msg.created_at).toLocaleTimeString()}
                                </p>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Composer */}
            <form onSubmit={handleSendMessage} className="p-4 border-t bg-white flex space-x-2">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Digite sua mensagem..."
                    className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                    disabled={loading}
                />
                <button
                    type="submit"
                    disabled={loading || !newMessage.trim()}
                    className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                    <Send size={20} />
                </button>
            </form>
        </div>
    );
};

export default ChatWindow;
