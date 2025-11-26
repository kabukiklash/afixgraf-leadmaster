const axios = require('axios');
const supabase = require('../db/supabaseClient');

const atendimentoService = {
    // 1. Assumir Atendimento
    async assumirAtendimento(telefone, responsavel) {
        // Atualizar dados_cliente
        const { error: updateError } = await supabase
            .from('dados_cliente')
            .update({
                atendimento_ia: false,
                responsavel_atual: responsavel,
                assumido_em: new Date().toISOString()
            })
            .eq('telefone', telefone);

        if (updateError) throw new Error(`Erro ao atualizar cliente: ${updateError.message}`);

        // Inserir evento "assumido" em chat_messages
        const { error: insertError } = await supabase
            .from('chat_messages')
            .insert({
                phone: telefone,
                agent_type: 'system',
                event: 'assumido',
                message: `Atendimento assumido por ${responsavel}`
            });

        if (insertError) throw new Error(`Erro ao registrar evento: ${insertError.message}`);

        return { success: true, message: 'Atendimento assumido com sucesso.' };
    },

    // 2. Enviar Mensagem
    async enviarMensagem(telefone, mensagem, responsavel) {
        // Inserir mensagem em chat_messages
        const { error: insertError } = await supabase
            .from('chat_messages')
            .insert({
                phone: telefone,
                agent_type: 'human',
                agent_name: responsavel,
                message: mensagem,
                message_type: 'text'
            });

        if (insertError) throw new Error(`Erro ao salvar mensagem: ${insertError.message}`);

        // Enviar POST para n8n
        try {
            await axios.post(process.env.N8N_WEBHOOK_URL, {
                telefone,
                mensagem,
                responsavel,
                timestamp: new Date().toISOString()
            });
        } catch (n8nError) {
            console.error('Erro ao enviar para n8n:', n8nError.message);
            // Não lançamos erro aqui para não falhar a requisição do front, mas logamos
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
                assumido_em: null
            })
            .eq('telefone', telefone);

        if (updateError) throw new Error(`Erro ao reativar IA: ${updateError.message}`);

        // Inserir evento "reativado" em chat_messages
        const { error: insertError } = await supabase
            .from('chat_messages')
            .insert({
                phone: telefone,
                agent_type: 'system',
                event: 'reativado',
                message: 'Atendimento retornado para IA'
            });

        if (insertError) throw new Error(`Erro ao registrar evento: ${insertError.message}`);

        return { success: true, message: 'Atendimento IA reativado com sucesso.' };
    }
};

module.exports = atendimentoService;
