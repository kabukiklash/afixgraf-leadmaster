const { supabase } = require('../db/supabaseClient');
const logger = require('../utils/logger');

class LeadsService {
    async getLeads(page = 1, limit = 20, status = null, search = null) {
        try {
            const from = (page - 1) * limit;
            const to = from + limit - 1;

            let query = supabase
                .from('dados_cliente')
                .select('*', { count: 'exact' });

            if (status) {
                // Exemplo: filtrar por atendimento_ia = 'true' ou 'false' ou 'pause'
                // Ajuste conforme os valores reais da coluna
                query = query.eq('atendimento_ia', status);
            }

            if (search) {
                query = query.or(`nomewpp.ilike.%${search}%,telefone.ilike.%${search}%`);
            }

            query = query.range(from, to).order('updated_at', { ascending: false }); // Assumindo updated_at ou similar

            const { data, error, count } = await query;

            if (error) {
                throw error;
            }

            return {
                data,
                meta: {
                    page,
                    limit,
                    total: count,
                    totalPages: Math.ceil(count / limit)
                }
            };
        } catch (error) {
            logger.error(`Error fetching leads: ${error.message}`);
            throw error;
        }
    }

    async getLeadMessages(telefone) {
        try {
            const { data, error } = await supabase
                .from('chat_messages')
                .select('*')
                .eq('contact_phone', telefone) // Assumindo contact_phone como chave estrangeira/link
                .order('created_at', { ascending: true });

            if (error) {
                throw error;
            }

            return data;
        } catch (error) {
            logger.error(`Error fetching messages for ${telefone}: ${error.message}`);
            throw error;
        }
    }
}

module.exports = new LeadsService();
