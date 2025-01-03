import { Router } from "express";
import { sequelizeHost } from "../core/Sequelize";
import { QueryTypes } from "sequelize";
import { authorizationTokenMiddleware } from "../middleware/TokenMiddleware";

const apiRouter = Router();

apiRouter.use(authorizationTokenMiddleware);

apiRouter.get("/course_completed", async (req, res) => {
    const course_id = req.query.course_id;
    const user_id = req.query.user_id;

    if (course_id == null || user_id == null) {
        res.status(400).send({ error: "Missing required parameters" });
        return;
    }

    const sql =
        "SELECT c.fullname AS course_name, p.timecompleted " +
        "FROM mdl_course_completions AS p " +
        "JOIN mdl_course AS c ON p.course = c.id " +
        "JOIN mdl_user AS u ON p.userid = u.id " +
        "JOIN mdl_course_completion_crit_compl AS cc ON u.id = cc.userid " +
        "WHERE u.username LIKE ? " +
        "AND c.enablecompletion = 1  AND (p.timecompleted IS NOT NULL OR p.timecompleted !='') " +
        "AND c.id = ? " +
        "LIMIT 1;";

    const result: { course_name: string; timecompleted: number }[] = await sequelizeHost.query(sql, {
        type: QueryTypes.SELECT,
        replacements: [user_id, course_id],
    });
    const data = result.length > 0 ? result[0].timecompleted : null;

    res.send({
        course_name: result[0].course_name,
        completed: result.length > 0,
        completed_at: data,
    });
});

apiRouter.get("/quiz_completed", async (req, res) => {
    const module_id = req.query.module_id;
    const user_id = req.query.user_id;

    if (module_id == null || user_id == null) {
        res.status(400).send({ error: "Missing required parameters" });
        return;
    }

    const sql =
        "SELECT c.fullname AS course_name, q.name AS quiz_name, qg.grade AS grade, qg.timemodified, cmc.completionstate " +
        "FROM mdl_quiz_grades AS qg " +
        "JOIN mdl_quiz AS q ON qg.quiz = q.id " +
        "JOIN mdl_user AS u ON qg.userid = u.id " +
        "JOIN mdl_course_modules AS cm on cm.instance = q.id " +
        "JOIN mdl_course AS c on c.id = cm.course " +
        "LEFT OUTER JOIN mdl_course_modules_completion AS cmc ON cmc.userid = u.id " +
        "WHERE cm.module = 17 " +
        "AND cmc.coursemoduleid = cm.id " +
        "AND u.username LIKE ?  " +
        "AND cm.id = ? " +
        "LIMIT 1" +
        ";";

    const result: { course_name: string; quiz_name: string; grade: number; timemodified: number; completionstate: number }[] = await sequelizeHost.query(sql, {
        type: QueryTypes.SELECT,
        replacements: [user_id, module_id],
    });

    res.send(result);
});

apiRouter.get("/module_completed", async (req, res) => {
    const module_id = req.query.module_id;
    const user_id = req.query.user_id;

    if (module_id == null || user_id == null) {
        res.status(400).send({ error: "Missing required parameters" });
        return;
    }

    const sql =
        "SELECT cmc.completionstate AS completionstate " +
        "FROM mdl_course_modules_completion AS cmc " +
        "JOIN mdl_course_modules AS cm ON cmc.coursemoduleid = cm.id " +
        "JOIN mdl_user as u ON cmc.userid = u.id " +
        "WHERE cm.module = 17 " +
        "AND u.username LIKE ? " +
        "AND cm.id = ?" +
        "LIMIT 1" +
        ";";

    const result: { completionstate: number }[] = await sequelizeHost.query(sql, {
        type: QueryTypes.SELECT,
        replacements: [user_id, module_id],
    });

    res.send(result);
});

apiRouter.get("/delete_attempts_and_override", async (req, res) => {
    const user_id = req.query.user_id;
    const quiz_id = req.query.quiz_id;

    if (user_id == null || quiz_id == null) {
        res.status(400).send({ error: "Missing required parameters" });
        return;
    }

    const sqlOverrides: string =
        "DELETE qo " +
        "FROM mdl_quiz_overrides AS qo " +
        "JOIN mdl_user AS u ON qo.userid = u.id " +
        "WHERE qo.quiz = ? " +
        "AND u.username = ?;";

    const sqlAttempts: string =
        "DELETE qa " +
        "FROM mdl_quiz_attempts AS qa " +
        "JOIN mdl_user AS u ON qa.userid = u.id " +
        "WHERE qa.quiz = ? " +
        "AND u.username = ?;";

    try {
        // Execute the first DELETE query
        const [resultOverrides] = await sequelizeHost.query(sqlOverrides, {
            type: QueryTypes.BULKDELETE,
            replacements: [quiz_id, user_id],
        });

        // Execute the second DELETE query
        const [resultAttempts] = await sequelizeHost.query(sqlAttempts, {
            type: QueryTypes.BULKDELETE,
            replacements: [quiz_id, user_id],
        });

        // Send the response with details of both delete operations
        res.send({
            message: "Delete operations completed",
            overridesDeleted: resultOverrides,
            attemptsDeleted: resultAttempts,
        });
    } catch (error) {
        // Handle errors
        res.status(500).send({ error: "Internal Server Error", details: error.message });
    }
});

export { apiRouter };
