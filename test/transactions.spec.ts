import request from "supertest";
import { afterAll, beforeAll, beforeEach, expect, test } from "vitest";
import { app } from "../src/app";
import { execSync } from "node:child_process";

beforeAll(async () => {
  await app.ready();
});

afterAll(async ()=> {
  await app.close();
});

beforeEach(() => {
  execSync("npm run knex:migrate:rollback --all");
  execSync("npm run knex:migrate:latest");
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

test("O usuário deve conseguir listar todas as transações", async () => {
  const createTransactionsResponse = await request(app.server)
    .post("/transactions")
    .send({
      title: "Nova transação",
      amount: 50,
      type: "credit"
    });

  const cookies = createTransactionsResponse.get("Set-Cookie");

  const listTransactionsResponse =  await request(app.server)
    .get("/transactions")
    .set("Cookie", cookies || [])
    .expect(200);

  expect(listTransactionsResponse.body.transactions).toEqual([
    expect.objectContaining({
      title: "Nova transação",
      amount: 50,
    })
  ]);
});

test("O usuário deve conseguir visualizar uma transação expecifica", async () => {
  const createTransactionsResponse = await request(app.server)
    .post("/transactions")
    .send({
      title: "Nova transação",
      amount: 50,
      type: "credit"
    });

  const cookies = createTransactionsResponse.get("Set-Cookie");

  const listTransactionsResponse =  await request(app.server)
    .get("/transactions")
    .set("Cookie", cookies || [])
    .expect(200);

  const transactionId = listTransactionsResponse.body.transactions[0].id;

  const getTransactionResponse = await request(app.server)
    .get(`/transactions/${transactionId}`)
    .set("Cookie", cookies || [])
    .expect(200);

  expect(getTransactionResponse.body.transaction).toEqual(
    expect.objectContaining({
      title: "Nova transação",
      amount: 50,
    })
  );
});


test("O usuário deve conseguir visualizar o resumo da conta", async () => {
  const createTransactionsResponse = await request(app.server)
    .post("/transactions")
    .send({
      title: "Credit transação",
      amount: 500,
      type: "credit"
    });

  const cookies = createTransactionsResponse.get("Set-Cookie");

  await request(app.server)
    .post("/transactions")
    .set("Cookie", cookies || [])
    .send({
      title: "Debet transação",
      amount: 50,
      type: "debit"
    });

  const summaryResponse =  await request(app.server)
    .get("/transactions/summary")
    .set("Cookie", cookies || [])
    .expect(200);

  expect(summaryResponse.body.summary).toEqual({
    amount: 450
  });
});


