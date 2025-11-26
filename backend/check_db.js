const supabase = require('./db/supabaseClient');

async function checkTables() {
    console.log('Verificando conexão e tabelas...');

    // Check dados_cliente
    const { data: clienteData, error: clienteError } = await supabase
        .from('dados_cliente')
        .select('count', { count: 'exact', head: true });

    if (clienteError) {
        console.error('❌ Erro ao acessar tabela dados_cliente:', clienteError.message);
    } else {
        console.log('✅ Tabela dados_cliente encontrada.');
    }

    // Check chat_messages
    const { data: chatData, error: chatError } = await supabase
        .from('chat_messages')
        .select('count', { count: 'exact', head: true });

    if (chatError) {
        console.error('❌ Erro ao acessar tabela chat_messages:', chatError.message);
    } else {
        console.log('✅ Tabela chat_messages encontrada.');
    }
}

checkTables();
