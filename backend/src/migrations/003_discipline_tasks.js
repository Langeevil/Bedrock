export const id = "003_discipline_tasks";
export const description = "Creates discipline tasks table with submissions and files.";

export async function up(client) {
  // Criar tabela de tarefas
  await client.query(`
    CREATE TABLE IF NOT EXISTS discipline_tasks (
      id SERIAL PRIMARY KEY,
      discipline_id INTEGER NOT NULL REFERENCES disciplines(id) ON DELETE CASCADE,
      created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      due_date TIMESTAMP,
      status VARCHAR(20) NOT NULL DEFAULT 'active',
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);

  // Criar tabela de arquivos de tarefas
  await client.query(`
    CREATE TABLE IF NOT EXISTS task_files (
      id SERIAL PRIMARY KEY,
      task_id INTEGER NOT NULL REFERENCES discipline_tasks(id) ON DELETE CASCADE,
      file_name VARCHAR(255) NOT NULL,
      file_path VARCHAR(500) NOT NULL,
      file_size INTEGER,
      uploaded_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      uploaded_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);

  // Criar tabela de submissões de alunos
  await client.query(`
    CREATE TABLE IF NOT EXISTS task_submissions (
      id SERIAL PRIMARY KEY,
      task_id INTEGER NOT NULL REFERENCES discipline_tasks(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      status VARCHAR(20) NOT NULL DEFAULT 'pending',
      submitted_at TIMESTAMP,
      completed_at TIMESTAMP,
      grade NUMERIC(5, 2),
      feedback TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
      UNIQUE(task_id, user_id)
    )
  `);

  // Criar tabela de arquivos de submissão
  await client.query(`
    CREATE TABLE IF NOT EXISTS submission_files (
      id SERIAL PRIMARY KEY,
      submission_id INTEGER NOT NULL REFERENCES task_submissions(id) ON DELETE CASCADE,
      file_name VARCHAR(255) NOT NULL,
      file_path VARCHAR(500) NOT NULL,
      file_size INTEGER,
      uploaded_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);

  // Criar índices
  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_discipline_tasks_discipline_id
      ON discipline_tasks(discipline_id)
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_task_submissions_task_id
      ON task_submissions(task_id)
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_task_submissions_user_id
      ON task_submissions(user_id)
  `);
}

export async function down(client) {
  await client.query("DROP TABLE IF EXISTS submission_files");
  await client.query("DROP TABLE IF EXISTS task_submissions");
  await client.query("DROP TABLE IF EXISTS task_files");
  await client.query("DROP TABLE IF EXISTS discipline_tasks");
}
