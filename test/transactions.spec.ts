import request from "supertest";
import { afterAll, beforeAll, test } from "vitest";
import { app } from "../src/app";

beforeAll(async () => {
  await app.ready();
});

afterAll(async ()=> {
  await app.close();
});

test("O usuário deve conseguir criar uma nova transação", async () => {
  await request(app.server)
    .post("/transactions")
    .send({
      title: "Nova transação",
      amount: 50,
      type: "credit"
    }).expect(201);
});
