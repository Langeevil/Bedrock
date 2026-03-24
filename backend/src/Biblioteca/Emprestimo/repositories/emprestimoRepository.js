import pool from "../../../db.js";
import Emprestimo from "../models/Emprestimo.js";

export async function criar(emprestimo) {
    const { usuarioId, livroId, dataPrevistaDevolucao } = emprestimo;
    const result = await pool.query(
        "INSERT INTO emprestimos (usuario_id, livro_id, data_prevista_devolucao) VALUES ($1, $2, $3) RETURNING *",
        [usuarioId, livroId, dataPrevistaDevolucao]
    );
    return new Emprestimo(mapToCamelCase(result.rows[0]));
}

export async function listar() {
    const result = await pool.query("SELECT * FROM emprestimos");
    return result.rows.map(row => new Emprestimo(mapToCamelCase(row)));
}

export async function buscarPorId(id) {
    const result = await pool.query("SELECT * FROM emprestimos WHERE id = $1", [id]);
    if (result.rows.length === 0) return null;
    return new Emprestimo(mapToCamelCase(result.rows[0]));
}

export async function atualizar(id, dados) {
    const { dataDevolucao, status, multa } = dados;
    const result = await pool.query(
        "UPDATE emprestimos SET data_devolucao = $1, status = $2, multa = $3 WHERE id = $4 RETURNING *",
        [dataDevolucao, status, multa, id]
    );
    if (result.rows.length === 0) return null;
    return new Emprestimo(mapToCamelCase(result.rows[0]));
}

export async function deletar(id) {
    const result = await pool.query(
        "DELETE FROM emprestimos WHERE id = $1 RETURNING *",
        [id]
    );
    return result.rows[0] || null;
}

function mapToCamelCase(row) {
    return {
        id: row.id,
        usuarioId: row.usuario_id,
        livroId: row.livro_id,
        dataEmprestimo: row.data_emprestimo,
        dataPrevistaDevolucao: row.data_prevista_devolucao,
        dataDevolucao: row.data_devolucao,
        status: row.status,
        multa: row.multa
    };
}

export default {
    criar,
    listar,
    buscarPorId,
    atualizar,
    deletar
};
