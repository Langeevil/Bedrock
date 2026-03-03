export function validateCreateDiscipline(body) {
  const errors = [];
  if (!body || typeof body !== "object") {
    errors.push("Corpo inválido");
    return errors;
  }

  const { name, code, professor } = body;

  if (!name || typeof name !== "string" || name.trim() === "")
    errors.push("'name' é obrigatório e deve ser uma string.");
  if (!code || typeof code !== "string" || code.trim() === "")
    errors.push("'code' é obrigatório e deve ser uma string.");
  if (!professor || typeof professor !== "string" || professor.trim() === "")
    errors.push("'professor' é obrigatório e deve ser uma string.");

  return errors;
}

export function validateUpdateDiscipline(body) {
  // For update, we allow partial updates but require at least one field
  const errors = [];
  if (!body || typeof body !== "object") {
    errors.push("Corpo inválido");
    return errors;
  }

  const { name, code, professor } = body;
  if (
    (name === undefined || name === null) &&
    (code === undefined || code === null) &&
    (professor === undefined || professor === null)
  ) {
    errors.push("Pelo menos um campo (name, code, professor) deve ser informado.");
    return errors;
  }

  if (name !== undefined && (typeof name !== "string" || name.trim() === ""))
    errors.push("'name' deve ser uma string não vazia quando informado.");
  if (code !== undefined && (typeof code !== "string" || code.trim() === ""))
    errors.push("'code' deve ser uma string não vazia quando informado.");
  if (professor !== undefined && (typeof professor !== "string" || professor.trim() === ""))
    errors.push("'professor' deve ser uma string não vazia quando informado.");

  return errors;
}

export default { validateCreateDiscipline, validateUpdateDiscipline };
