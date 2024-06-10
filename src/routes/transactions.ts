import { randomUUID } from "crypto";
import { FastifyInstance } from "fastify";
import { z } from "zod";
import { knex } from "../database";
import { checkSessionIdExists } from "../middlewares/check-session-id-transactions";

export async function transactionsRoutes(app: FastifyInstance) {
  app.post("/", async (request, response) => {
    const createTransactionsBodySchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(["credit", "debit"])
    });

    const { title, amount, type } = createTransactionsBodySchema.parse(request.body);

    let session_id = request.cookies.sessionId;

    if(!session_id) {
      session_id = randomUUID();

      response.cookie("sessionId", session_id, {
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 dias
      });
    }

    await knex("transactions").insert({
      id: randomUUID(),
      title,
      amount: type === "credit" ? amount : (amount * -1),
      session_id
    });

    return response.status(201).send();
  });

  app.get("/", { preHandler: [checkSessionIdExists] }, async (request, response) => {
    const { sessionId } = request.cookies;

    const transactions = await knex("transactions")
      .where("session_id", sessionId)
      .select();

    return response.code(200).send({
      transactions
    });
  });

  app.get("/:id", { preHandler: [checkSessionIdExists] }, async (request, response) => {
    const { sessionId } = request.cookies;

    const getTransactionsParamsSchema = z.object({
      id: z.string().uuid()
    });

    const { id } = getTransactionsParamsSchema.parse(request.params);

    const transaction = await knex("transactions")
      .where("id", id)
      .andWhere("session_id", sessionId)
      .first();

    if(!transaction) {
      return response.code(400).send({
        error: "Transação não encontrada"
      });
    }

    return response.code(200).send({
      transaction
    });
  });

  app.get("/summary", { preHandler: [checkSessionIdExists]}, async (request, response) => {
    const { sessionId } = request.cookies;

    const summary = await knex("transactions")
      .where("session_id", sessionId)
      .sum("amount", { as: "amount"})
      .first();

    return response.code(200).send({
      summary
    });
  });
}
