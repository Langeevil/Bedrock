import livroRepository from "../repositories/livroRepository.js";

export async function criarLivro(dados) {
    return await livroRepository.criar(dados);
}

export async function listarLivros() {
    return await livroRepository.listar();
}

export async function buscarLivroPorId(id) {
    return await livroRepository.buscarPorId(id);
}

export async function atualizarLivro(id, dados) {
    return await livroRepository.atualizar(id, dados);
}

export async function deletarLivro(id) {
    return await livroRepository.deletar(id);
}

export default {
    criarLivro,
    listarLivros,
    buscarLivroPorId,
    atualizarLivro,
    deletarLivro
};
