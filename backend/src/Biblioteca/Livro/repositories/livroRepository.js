import pool from "../../../db.js";
import Livro from "../models/Livro.js";

export async function criar(livro) {
    const { nome, autor, editora, datapubli } = livro;
    const result = await pool.query(
        "INSERT INTO livros (nome, autor, editora, datapubli) VALUES ($1, $2, $3, $4) RETURNING *",
        [nome, autor, editora, datapubli]
    );
    return new Livro(result.rows[0]);
}

export async function listar() {
    const result = await pool.query("SELECT * FROM livros");
    return result.rows.map(row => new Livro(row));
}

export async function buscarPorId(id) {
    const result = await pool.query("SELECT * FROM livros WHERE id = $1", [id]);
    if (result.rows.length === 0) return null;
    return new Livro(result.rows[0]);
}

export async function atualizar(id, dados) {
    const { nome, autor, editora, datapubli } = dados;
    const result = await pool.query(
        "UPDATE livros SET nome = $1, autor = $2, editora = $3, datapubli = $4 WHERE id = $5 RETURNING *",
        [nome, autor, editora, datapubli, id]
    );
    if (result.rows.length === 0) return null;
    return new Livro(result.rows[0]);
}

export async function deletar(id) {
    const result = await pool.query(
        "DELETE FROM livros WHERE id = $1 RETURNING *",
        [id]
    );
    return result.rows[0] || null;
}

export default {
    criar,
    listar,
    buscarPorId,
    atualizar,
    deletar
};
