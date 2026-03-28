import livroService from "../services/livroService.js";

export async function criar(req, res) {
    try {
        const livro = await livroService.criarLivro(req.body);
        res.status(201).json(livro);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export async function listar(req, res) {
    try {
        const livros = await livroService.listarLivros();
        res.status(200).json(livros);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export async function buscarPorId(req, res) {
    try {
        const { id } = req.params;
        const livro = await livroService.buscarLivroPorId(id);
        if (!livro) {
            return res.status(404).json({ message: "Livro não encontrado" });
        }
        res.status(200).json(livro);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export async function atualizar(req, res) {
    try {
        const { id } = req.params;
        const livro = await livroService.atualizarLivro(id, req.body);
        if (!livro) {
            return res.status(404).json({ message: "Livro não encontrado" });
        }
        res.status(200).json(livro);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export async function deletar(req, res) {
    try {
        const { id } = req.params;
        const livro = await livroService.deletarLivro(id);
        if (!livro) {
            return res.status(404).json({ message: "Livro não encontrado" });
        }
        res.status(200).json({ message: "Livro deletado com sucesso" });
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
