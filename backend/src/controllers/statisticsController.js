import pool from "../db.js";

export async function getStatistics(req, res) {
  try {
    // Total de alunos
    const totalStudentsResult = await pool.query(
      "SELECT COUNT(*)::int AS count FROM users WHERE role = 'student'"
    );

    // Cursos/disciplinas ativas do usuário
    const activeCoursesResult = await pool.query(
      "SELECT COUNT(*)::int AS count FROM disciplines WHERE user_id = $1",
      [req.userId]
    );

    // Total de disciplinas cadastradas
    const disciplinesCountResult = await pool.query(
      "SELECT COUNT(*)::int AS count FROM disciplines"
    );

    // Taxa de conclusão de perfil
    const totalUsersResult = await pool.query(
      "SELECT COUNT(*)::int AS count FROM users"
    );

    const filledProfileResult = await pool.query(
      "SELECT COUNT(*)::int AS count FROM users WHERE role IS NOT NULL AND role <> ''"
    );

    const totalUsers = totalUsersResult.rows[0]?.count || 0;
    const filledProfiles = filledProfileResult.rows[0]?.count || 0;
    const graduationRate = totalUsers > 0 ? Math.round((filledProfiles / totalUsers) * 100) : 0;

    return res.json({
      totalStudents: totalStudentsResult.rows[0]?.count || 0,
      activeCourses: activeCoursesResult.rows[0]?.count || 0,
      disciplinesCount: disciplinesCountResult.rows[0]?.count || 0,
      graduationRate,
    });
  } catch (err) {
    console.error("Erro ao buscar estatísticas:", err);
    return res.status(500).json({ error: "Erro ao buscar estatísticas." });
  }
}
