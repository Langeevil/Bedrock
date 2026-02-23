import pool from "../db.js";

export async function getDashboardStats(req, res) {
  try {
    const totalStudentsResult = await pool.query(
      "SELECT COUNT(*)::int AS count FROM users WHERE role = 'aluno'"
    );

    const activeCoursesResult = await pool.query(
      "SELECT COUNT(*)::int AS count FROM disciplines WHERE user_id = $1",
      [req.userId]
    );

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
      graduationRate,
    });
  } catch (err) {
    console.error("Erro ao buscar dashboard stats:", err);
    return res.status(500).json({ error: "Erro ao buscar estatisticas do dashboard." });
  }
}
