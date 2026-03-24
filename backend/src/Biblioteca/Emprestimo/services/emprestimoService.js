import emprestimoRepository from "../repositories/emprestimoRepository.js";

export async function criarEmprestimo(dados) {
    return await emprestimoRepository.criar(dados);
}

export async function listarEmprestimos() {
    return await emprestimoRepository.listar();
}

export async function buscarEmprestimoPorId(id) {
    return await emprestimoRepository.buscarPorId(id);
}

export async function atualizarEmprestimo(id, dados) {
    return await emprestimoRepository.atualizar(id, dados);
}

export async function deletarEmprestimo(id) {
    return await emprestimoRepository.deletar(id);
}

export default {
    criarEmprestimo,
    listarEmprestimos,
    buscarEmprestimoPorId,
    atualizarEmprestimo,
    deletarEmprestimo
};
