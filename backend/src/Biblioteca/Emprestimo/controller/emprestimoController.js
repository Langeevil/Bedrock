import emprestimoService from "../services/emprestimoService.js";

export async function criar(req, res) {
    try {
        const emprestimo = await emprestimoService.criarEmprestimo(req.body);
        res.status(201).json(emprestimo);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export async function listar(req, res) {
    try {
        const emprestimos = await emprestimoService.listarEmprestimos();
        res.status(200).json(emprestimos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export async function buscarPorId(req, res) {
    try {
        const { id } = req.params;
        const emprestimo = await emprestimoService.buscarEmprestimoPorId(id);
        if (!emprestimo) {
            return res.status(404).json({ message: "Empréstimo não encontrado" });
        }
        res.status(200).json(emprestimo);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export async function atualizar(req, res) {
    try {
        const { id } = req.params;
        const emprestimo = await emprestimoService.atualizarEmprestimo(id, req.body);
        if (!emprestimo) {
            return res.status(404).json({ message: "Empréstimo não encontrado" });
        }
        res.status(200).json(emprestimo);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export async function deletar(req, res) {
    try {
        const { id } = req.params;
        const emprestimo = await emprestimoService.deletarEmprestimo(id);
        if (!emprestimo) {
            return res.status(404).json({ message: "Empréstimo não encontrado" });
        }
        res.status(200).json({ message: "Empréstimo deletado com sucesso" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export default {
    criar,
    listar,
    buscarPorId,
    atualizar,
    deletar
};
