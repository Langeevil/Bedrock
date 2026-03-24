class Emprestimo {
    constructor({ id, usuarioId, livroId, dataEmprestimo, dataPrevistaDevolucao, dataDevolucao, status, multa }) {
        this.id = id;
        this.usuarioId = usuarioId;
        this.livroId = livroId;
        this.dataEmprestimo = dataEmprestimo;
        this.dataPrevistaDevolucao = dataPrevistaDevolucao;
        this.dataDevolucao = dataDevolucao;
        this.status = status;
        this.multa = multa;
    }
}

export default Emprestimo;
