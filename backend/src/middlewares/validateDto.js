export default function validateDto(validator) {
  return (req, res, next) => {
    try {
      const errors = validator(req.body);
      if (errors && errors.length > 0) {
        return res.status(400).json({ errors });
      }
      next();
    } catch (err) {
      console.error("Erro no middleware de validação DTO:", err);
      res.status(500).json({ error: "Erro de validação" });
    }
  };
}
