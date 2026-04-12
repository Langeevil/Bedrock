export const id = "004_legacy_cleanup";
export const description = "Moves remaining legacy tables to migrations and adds organization scoping.";

export async function up(client) {
  // Garantir que a tabela de livros seja escopada
  await client.query(`
    CREATE TABLE IF NOT EXISTS livros (
      id SERIAL PRIMARY KEY,
      organization_id INTEGER REFERENCES organizations(id) ON DELETE SET NULL,
      nome VARCHAR(255) NOT NULL,
      autor VARCHAR(255),
      editora VARCHAR(255),
      datapubli VARCHAR(20),
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);

  await client.query(`
    ALTER TABLE livros
    ADD COLUMN IF NOT EXISTS organization_id INTEGER REFERENCES organizations(id) ON DELETE SET NULL
  `);

  // Garantir que a tabela de empréstimos seja escopada
  await client.query(`
    CREATE TABLE IF NOT EXISTS emprestimos (
      id SERIAL PRIMARY KEY,
      organization_id INTEGER REFERENCES organizations(id) ON DELETE SET NULL,
      usuario_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      livro_id INTEGER REFERENCES livros(id) ON DELETE CASCADE,
      data_emprestimo TIMESTAMP NOT NULL DEFAULT NOW(),
      data_prevista_devolucao TIMESTAMP NOT NULL,
      data_devolucao TIMESTAMP,
      status VARCHAR(20) DEFAULT 'ativo',
      multa DECIMAL(10, 2) DEFAULT 0.00,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);

  await client.query(`
    ALTER TABLE emprestimos
    ADD COLUMN IF NOT EXISTS organization_id INTEGER REFERENCES organizations(id) ON DELETE SET NULL
  `);

  // Backfill organization_id para dados legados (se houver)
  await client.query(`
    UPDATE livros l
    SET organization_id = (SELECT id FROM organizations ORDER BY id ASC LIMIT 1)
    WHERE l.organization_id IS NULL
  `);

  await client.query(`
    UPDATE emprestimos e
    SET organization_id = (SELECT id FROM organizations ORDER BY id ASC LIMIT 1)
    WHERE e.organization_id IS NULL
  `);

  // Criar índices para performance
  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_livros_organization_id ON livros(organization_id)
  `);
  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_emprestimos_organization_id ON emprestimos(organization_id)
  `);
}

export async function down(client) {
  // Opcional: remover colunas se necessário, mas em produção evitamos down destrutivo
}
