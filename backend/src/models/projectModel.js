export class Project {
  constructor({ id, name, user_id, created_at, tasks = [], tags = [] }) {
    this.id = id;
    this.name = name;
    this.user_id = user_id;
    this.created_at = created_at;
    
    // Lista de objetos Task { id, title, status, tags: [] }
    this.tasks = tasks; 
    // Lista de objetos Tag { id, name, color }
    this.tags = tags;   
  }

  /**
   * Formata os dados para bibliotecas de Grafo (ex: D3, React Force Graph)
   * Nodes: Projetos, Tarefas e Tags
   * Links: Conexões entre eles
   */
  toGraphData() {
    const nodes = [
      { id: `p-${this.id}`, label: this.name, type: 'project', color: '#4f46e5' },
      ...this.tags.map(tag => ({ 
        id: `tg-${tag.id}`, 
        label: tag.name, 
        type: 'tag', 
        color: tag.color || '#10b981' 
      })),
      ...this.tasks.map(task => ({ 
        id: `tk-${task.id}`, 
        label: task.title, 
        type: 'task',
        status: task.status 
      }))
    ];

    const links = [];

    // 1. Conectar Projeto às suas Tarefas
    this.tasks.forEach(task => {
      links.push({ source: `p-${this.id}`, target: `tk-${task.id}`, relationship: 'contains' });
      
      // 2. Conectar Tarefas às suas respectivas Tags (se houver o vínculo)
      if (task.tags && Array.isArray(task.tags)) {
        task.tags.forEach(tagId => {
          links.push({ source: `tk-${task.id}`, target: `tg-${tagId}`, relationship: 'labeled_with' });
        });
      }
    });

    return { nodes, links };
  }
}
