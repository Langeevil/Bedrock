export function validateCreateProject(body) {
  const errors = [];
  if (!body || typeof body !== "object") {
    errors.push("Corpo inválido");
    return errors;
  }

  const { name } = body;

  if (!name || typeof name !== "string" || name.trim() === "") {
    errors.push("'name' é obrigatório e deve ser uma string.");
  }

  return errors;
}

export function validateAddTask(body) {
  const errors = [];
  const { title } = body;

  if (!title || typeof title !== "string" || title.trim() === "") {
    errors.push("'title' da tarefa é obrigatório.");
  }

  return errors;
}

export default { validateCreateProject, validateAddTask };
