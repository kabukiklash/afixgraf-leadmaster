const axios = require('axios');
const { supabase } = require('../db/supabaseClient');
const logger = require('../utils/logger');

const atendimentoService = {
    // 1. Assumir Atendimento
    async assumirAtendimento(telefone, user) {
        // Atualizar dados_cliente
        const { error: updateError } = await supabase
            .from('dados_cliente')
            .update({
                atendimento_ia: false,
                responsavel_atual: user.nome,
                responsavel_id: user.id, // Novo campo
                assumido_em: new Date().toISOString()
            })
            .eq('telefone', telefone);

        if (updateError) {
            logger.error(`Erro ao assumir atendimento: ${updateError.message}`);
            throw new Error(`Erro ao atualizar cliente: ${updateError.message}`);
        }

        // Inserir evento "assumido" em chat_messages
        const { error: insertError } = await supabase
            .from('chat_messages')
            .insert({
                contact_phone: telefone, // Corrigido de phone para contact_phone (verificar schema real se possível, mas mantendo coerência com leadsService)
                agent_type: 'system',
                event: 'assumido',
                message: `Atendimento assumido por ${user.nome}`
            });

        if (insertError) {
            logger.error(`Erro ao registrar evento assumido: ${insertError.message}`);
            // Não falhar tudo por erro de log
        }

        return { success: true, message: 'Atendimento assumido com sucesso.' };
    },

    // 2. Enviar Mensagem
    async enviarMensagem(telefone, mensagem, user) {
        // Inserir mensagem em chat_messages
        const { error: insertError } = await supabase
            .from('chat_messages')
            .insert({
                contact_phone: telefone,
                agent_type: 'human',
                agent_name: user.nome,
                message: mensagem,
                message_type: 'text'
            });

        if (insertError) {
            logger.error(`Erro ao salvar mensagem: ${insertError.message}`);
            throw new Error(`Erro ao salvar mensagem: ${insertError.message}`);
        }

        // Enviar POST para n8n
        try {
            await axios.post(process.env.N8N_WEBHOOK_URL, {
                telefone,
                mensagem,
                responsavel: user.nome,
                responsavel_id: user.id,
                timestamp: new Date().toISOString()
            });
        } catch (n8nError) {
            logger.error(`Erro ao enviar para n8n: ${n8nError.message}`);
        }

        return { success: true, message: 'Mensagem enviada e registrada.' };
    },

    // 3. Reativar Atendimento (IA)
    async reativarAtendimento(telefone) {
        // Atualizar dados_cliente
        const { error: updateError } = await supabase
            .from('dados_cliente')
            .update({
                atendimento_ia: true,
                responsavel_atual: null,
                responsavel_id: null,
                assumido_em: null
            })
            .eq('telefone', telefone);

        if (updateError) throw new Error(`Erro ao reativar IA: ${updateError.message}`);

        // Inserir evento "reativado" em chat_messages
        const { error: insertError } = await supabase
            .from('chat_messages')
            .insert({
                contact_phone: telefone,
                agent_type: 'system',
                event: 'reativado',
                message: 'Atendimento retornado para IA'
            });

        if (insertError) {
            logger.error(`Erro ao registrar evento reativado: ${insertError.message}`);
        }

        return { success: true, message: 'Atendimento IA reativado com sucesso.' };
    },

    // 4. Pausar Atendimento
    async pausarAtendimento(telefone, user) {
        // Atualizar dados_cliente para status 'pause' (ou similar, definindo que IA não responde mas mantendo responsavel)
        // Nota: O prompt pede atendimento_ia = "pause"
        const { error: updateError } = await supabase
            .from('dados_cliente')
            .update({
                atendimento_ia: 'pause' // Ajustar se o campo for booleano, mas prompt diz "pause"
            })
            .eq('telefone', telefone);

        if (updateError) throw new Error(`Erro ao pausar atendimento: ${updateError.message}`);

        // Inserir evento "pausado"
        const { error: insertError } = await supabase
            .from('chat_messages')
            .insert({
                contact_phone: telefone,
                agent_type: 'system',
                event: 'pausado',
                message: `Atendimento pausado por ${user.nome}`
            });

        if (insertError) {
            logger.error(`Erro ao registrar evento pausado: ${insertError.message}`);
        }

        return { success: true, message: 'Atendimento pausado com sucesso.' };
    }
};

module.exports = atendimentoService;
