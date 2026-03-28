import estatisticaRepository from "../repositories/estatisticaRepository.js";

export async function obterRelatorioNN() {
    return await estatisticaRepository.relatorioNN();
}

export default {
    obterRelatorioNN
};
