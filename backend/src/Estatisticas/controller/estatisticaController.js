import estatisticaService from "../services/estatisticaService.js";

export async function getRelatorioNN(req, res) {
    try {
        const relatorio = await estatisticaService.obterRelatorioNN();
        return res.json(relatorio);
    } catch (error) {
        console.error("Erro ao gerar relatório N:N:", error);
        return res.status(500).json({ error: "Erro ao gerar relatório de estatísticas." });
    }
}

export default {
    getRelatorioNN
};
