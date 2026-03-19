import projectRepository from "../repositories/projectRepository.js";

/**
 * Cria um novo projeto associado ao usuário logado
 */
export async function createProject(req, res) {
  try {
    const { name } = req.body;
    const userId = req.userId; // Definido pelo authMiddleware

    const project = await projectRepository.create({ name, user_id: userId });
    
    res.status(201).json({
      message: "Projeto criado com sucesso!",
      project
    });
  } catch (error) {
    console.error("Erro ao criar projeto:", error);
    res.status(500).json({ error: "Erro interno ao criar projeto." });
  }
}

/**
 * Retorna os dados completos do projeto, incluindo tarefas e tags para o grafo
 */
export async function getProjectDetails(req, res) {
  try {
    const { id } = req.params;
    const project = await projectRepository.findById(id);

    if (!project) {
      return res.status(404).json({ error: "Projeto não encontrado." });
    }

    // Gera os dados formatados para o grafo usando o método da Model
    const graphData = project.toGraphData();

    res.json({
      project,
      graphData
    });
  } catch (error) {
    console.error("Erro ao buscar detalhes do projeto:", error);
    res.status(500).json({ error: "Erro ao processar dados do projeto." });
  }
}

/**
 * Busca todos os projetos do usuário logado
 */
export async function listUserProjects(req, res) {
  try {
    const userId = req.userId;
    const projects = await projectRepository.findByUserId(userId);
    res.json(projects);
  } catch (error) {
    console.error("Erro ao listar projetos:", error);
    res.status(500).json({ error: "Erro ao listar projetos." });
  }
}

export default {
  createProject,
  getProjectDetails,
  listUserProjects
};
