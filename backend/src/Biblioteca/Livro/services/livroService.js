import Livro from "../models/Livro";
import livroRepository, { atualizar, criar, deletar, listar } from "../repositories/livroRepository"

export async function criarlivro(livro) {
    const livro = new Livro(livro);
    return await livroRepository(criar)
}

export async function listarLivro() {
    return await livroRepository(listar)
}

export async function buscarPorId() {
    return await livroRepository(buscarPorId)
}

export async function atualizarLivro(livro) {
    const livro = new Livro(livro)
    return await livroRepository(atualizar)
}

export async function deletarLivro() {
    return await livroRepository(deletar)
}

export default {
    criarlivro,
    listarLivro,
    buscarPorId,
    atualizarLivro,
    deletarLivro
}
