import pool from "../../../db";
import Livro from "../models/Livro";

export async function criar(livro){
    const result = await pool.query(
        "INSERT INTO livros(id, name, autor, editora, datapublic) VALUES ($1, $2, $3, $4, $5) RETURNING *"
        [livro.id, livro.name, livro.autor, livro.editora, livro.datapubli]
    )
    return new Livro(result.rows[0])
}

export async function listar(){
    const result = await pool.query(
        "SELECT * FROM livros RETURNING *"
    )
    return result.rows[0];
}

export async function buscarPorId(id) {
    const result = await pool.query(
        "SELECT * FROM livros WHERE id = $1 RETURNING *"
        [id]
    )
    return result.rows.map(row => new Livro(row))
}

export async function atualizar(id, dados) {
    const result = await pool.query(
        "UPDATE livros SET name = $1, autor = $2, editora = $3, datapubli = $4 WHERE id = $5 RETURNING * "
        [dados.name, dados.autor, dados.editora, dados.datapubli, id]
    )
    return new Livro(result.rows[id])
}

export async function deletar(id) {
    const result = await pool.query(
        "DELETE * FROM livros WHERE id = $1 RETURNING * "
        [id]
    )
    return result.rows[0] || null
}

export default {
    criar,
    listar,
    buscarPorId,
    atualizar,
    deletar
}
