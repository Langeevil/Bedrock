import pool from "../../db.js";
import Estatistica from "../models/Estatistica.js";

export async function relatorioNN() {
    const query = `
        SELECT
            d.id AS id_disciplina,
            u.id AS id_usuario,
            u.nome,
            COALESCE(dp.content, 'Sem tarefa') AS tarefa
        FROM disciplines d
        JOIN discipline_memberships dm ON d.id = dm.discipline_id
        JOIN users u ON dm.user_id = u.id
        LEFT JOIN discipline_posts dp ON d.id = dp.discipline_id AND u.id = dp.author_id
        ORDER BY d.id, u.id
    `;
    const result = await pool.query(query);
    return result.rows.map(row => new Estatistica({
        id_disciplina: row.id_disciplina,
        id_usuario: row.id_usuario,
        nome: row.nome,
        tarefa: row.tarefa
    }));
}

export default {
    relatorioNN
};
