import pool from "./db.js";

export async function ensureAppSchema() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(120) NOT NULL,
        email VARCHAR(160) NOT NULL UNIQUE,
        senha_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20),
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    await pool.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS role VARCHAR(20)
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS disciplines (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(120) NOT NULL,
        code VARCHAR(40) NOT NULL,
        professor VARCHAR(120) NOT NULL,
        description TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    // if the table already existed but lacked user_id (older schema), add it
    await pool.query(`
      ALTER TABLE disciplines
      ADD COLUMN IF NOT EXISTS user_id INTEGER
    `);

    // Add description and updated_at columns if they don't exist
    await pool.query(`
      ALTER TABLE disciplines
      ADD COLUMN IF NOT EXISTS description TEXT
    `);

    await pool.query(`
      ALTER TABLE disciplines
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    `);

    // create index only if the column exists to avoid errors on legacy DBs
    await pool.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name='disciplines' AND column_name='user_id'
        ) THEN
          CREATE INDEX IF NOT EXISTS idx_disciplines_user_id ON disciplines(user_id);
        END IF;
      END $$;
    `);

    // Create discipline_posts table for discipline announcements/posts
    await pool.query(`
      CREATE TABLE IF NOT EXISTS discipline_posts (
        id BIGSERIAL PRIMARY KEY,
        discipline_id INTEGER NOT NULL REFERENCES disciplines(id) ON DELETE CASCADE,
        author_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        pinned BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        deleted_at TIMESTAMP
      )
    `);

    // Create index for discipline_posts
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_discipline_posts_discipline_id 
      ON discipline_posts(discipline_id)
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_discipline_posts_created_at_desc
      ON discipline_posts(discipline_id, created_at DESC)
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS discipline_files (
        id BIGSERIAL PRIMARY KEY,
        discipline_id INTEGER NOT NULL REFERENCES disciplines(id) ON DELETE CASCADE,
        file_name VARCHAR(255) NOT NULL,
        original_name VARCHAR(255) NOT NULL,
        storage_provider VARCHAR(30) NOT NULL DEFAULT 'local',
        storage_key VARCHAR(255) NOT NULL,
        mime_type VARCHAR(120) NOT NULL,
        size_bytes BIGINT NOT NULL,
        uploaded_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        UNIQUE (discipline_id, file_name)
      )
    `);

    // Create index for discipline_files
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_discipline_files_discipline_id 
      ON discipline_files(discipline_id)
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_discipline_files_created_at_desc
      ON discipline_files(discipline_id, created_at DESC)
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS chat_conversations (
        id SERIAL PRIMARY KEY,
        type VARCHAR(20) NOT NULL,
        name VARCHAR(160),
        description TEXT,
        is_private BOOLEAN NOT NULL DEFAULT TRUE,
        created_by INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        last_message_id BIGINT,
        archived_at TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS chat_conversation_members (
        conversation_id INTEGER NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        role VARCHAR(20) NOT NULL DEFAULT 'member',
        joined_at TIMESTAMP NOT NULL DEFAULT NOW(),
        last_read_message_id BIGINT,
        last_read_at TIMESTAMP,
        muted_until TIMESTAMP,
        PRIMARY KEY (conversation_id, user_id)
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS chat_direct_pairs (
        conversation_id INTEGER PRIMARY KEY REFERENCES chat_conversations(id) ON DELETE CASCADE,
        user_low_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        user_high_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE (user_low_id, user_high_id)
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS chat_user_presence (
        user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        status VARCHAR(20) NOT NULL DEFAULT 'offline',
        last_seen_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id BIGSERIAL PRIMARY KEY,
        conversation_id INTEGER REFERENCES chat_conversations(id) ON DELETE CASCADE,
        sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        message_type VARCHAR(20) NOT NULL DEFAULT 'text',
        reply_to_message_id BIGINT REFERENCES chat_messages(id) ON DELETE SET NULL,
        edited_at TIMESTAMP,
        deleted_at TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    await pool.query(`
      ALTER TABLE chat_messages
      ADD COLUMN IF NOT EXISTS conversation_id INTEGER REFERENCES chat_conversations(id) ON DELETE CASCADE
    `);

    await pool.query(`
      ALTER TABLE chat_messages
      ADD COLUMN IF NOT EXISTS sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE
    `);

    await pool.query(`
      ALTER TABLE chat_messages
      ADD COLUMN IF NOT EXISTS message_type VARCHAR(20) NOT NULL DEFAULT 'text'
    `);

    await pool.query(`
      ALTER TABLE chat_messages
      ADD COLUMN IF NOT EXISTS reply_to_message_id BIGINT REFERENCES chat_messages(id) ON DELETE SET NULL
    `);

    await pool.query(`
      ALTER TABLE chat_messages
      ADD COLUMN IF NOT EXISTS edited_at TIMESTAMP
    `);

    await pool.query(`
      ALTER TABLE chat_messages
      ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS chat_message_attachments (
        id BIGSERIAL PRIMARY KEY,
        message_id BIGINT NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
        storage_provider VARCHAR(30) NOT NULL,
        storage_key VARCHAR(255) NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        mime_type VARCHAR(120) NOT NULL,
        size_bytes BIGINT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email_lower
        ON users ((LOWER(email)))
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_chat_conversation_members_user
        ON chat_conversation_members(user_id)
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id_desc
        ON chat_messages(conversation_id, id DESC)
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_chat_conversations_updated_at_desc
        ON chat_conversations(updated_at DESC)
    `);

    await pool.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.tables
          WHERE table_schema = 'public' AND table_name = 'chat_rooms'
        ) THEN
          INSERT INTO chat_conversations (id, type, name, description, is_private, created_by, created_at, updated_at)
          SELECT
            r.id,
            'channel',
            r.name,
            NULL,
            CASE WHEN r.name = 'Geral' THEN FALSE ELSE TRUE END,
            r.created_by,
            COALESCE(r.created_at, NOW()),
            COALESCE(r.created_at, NOW())
          FROM chat_rooms r
          WHERE NOT EXISTS (
            SELECT 1
            FROM chat_conversations c
            WHERE c.id = r.id
          );

          PERFORM setval(
            pg_get_serial_sequence('chat_conversations', 'id'),
            GREATEST(
              COALESCE((SELECT MAX(id) FROM chat_conversations), 1),
              1
            ),
            TRUE
          );
        END IF;
      END $$;
    `);

    await pool.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.tables
          WHERE table_schema = 'public' AND table_name = 'chat_room_members'
        ) THEN
          INSERT INTO chat_conversation_members (conversation_id, user_id, role, joined_at)
          SELECT
            m.room_id,
            m.user_id,
            'member',
            NOW()
          FROM chat_room_members m
          WHERE EXISTS (
            SELECT 1 FROM chat_conversations c WHERE c.id = m.room_id
          )
          ON CONFLICT (conversation_id, user_id) DO NOTHING;
        END IF;
      END $$;
    `);

    await pool.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'chat_messages' AND column_name = 'room_id'
        ) THEN
          UPDATE chat_messages
          SET conversation_id = room_id
          WHERE conversation_id IS NULL
            AND room_id IS NOT NULL;
        END IF;
      END $$;
    `);

    await pool.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'chat_messages' AND column_name = 'user_id'
        ) THEN
          UPDATE chat_messages
          SET sender_id = user_id
          WHERE sender_id IS NULL
            AND user_id IS NOT NULL;
        END IF;
      END $$;
    `);

    await pool.query(`
      UPDATE chat_conversations c
      SET last_message_id = last_msg.id,
          updated_at = COALESCE(last_msg.created_at, c.updated_at, c.created_at, NOW())
      FROM (
        SELECT DISTINCT ON (conversation_id)
          id,
          conversation_id,
          created_at
        FROM chat_messages
        WHERE conversation_id IS NOT NULL
        ORDER BY conversation_id, id DESC
      ) last_msg
      WHERE c.id = last_msg.conversation_id
        AND (c.last_message_id IS NULL OR c.last_message_id <> last_msg.id)
    `);

    await pool.query(`
      INSERT INTO chat_conversations (type, name, description, is_private, created_by)
      SELECT
        'channel',
        'Geral',
        'Canal publico inicial',
        FALSE,
        (
          SELECT id
          FROM users
          ORDER BY id
          LIMIT 1
        )
      WHERE NOT EXISTS (
        SELECT 1
        FROM chat_conversations
        WHERE name = 'Geral'
          AND archived_at IS NULL
      )
    `);

    await pool.query(`
      UPDATE chat_conversations
      SET is_private = FALSE,
          type = 'channel',
          updated_at = NOW()
      WHERE name = 'Geral'
        AND archived_at IS NULL
    `);

    await pool.query(`
      INSERT INTO chat_conversation_members (conversation_id, user_id, role)
      SELECT geral.id, u.id, CASE WHEN u.id = geral.created_by THEN 'owner' ELSE 'member' END
      FROM chat_conversations geral
      JOIN users u ON TRUE
      WHERE geral.name = 'Geral'
        AND geral.archived_at IS NULL
      ON CONFLICT (conversation_id, user_id) DO NOTHING
    `);
  } catch (err) {
    console.error("Erro ao garantir schema:", err);
    throw err;
  }
}
