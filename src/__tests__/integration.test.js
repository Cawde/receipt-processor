const request = require("supertest");
const express = require("express");
const { app, startServer } = require("../app.js");

describe("Receipt Processor Integration Tests", () => {
  let server;
  const TEST_PORT = 4000;

  beforeAll(async () => {
    server = await startServer(TEST_PORT);
  });

  afterAll(async () => {
    if (server) {
      await server.close();
    }
  });

  test("Full receipt processing workflow", async () => {
    const processResponse = await request(app)
      .post("/receipts/process")
      .send({
        retailer: "M&M Corner Market",
        purchaseDate: "2022-03-20",
        purchaseTime: "14:33",
        items: [
          { shortDescription: "Gatorade", price: "2.25" },
          { shortDescription: "Gatorade", price: "2.25" },
          { shortDescription: "Gatorade", price: "2.25" },
          { shortDescription: "Gatorade", price: "2.25" },
        ],
        total: "9.00",
      });

    expect(processResponse.status).toBe(200);
    expect(processResponse.body).toHaveProperty("id");

    const receiptId = processResponse.body.id;

    const pointsResponse = await request(app).get(
      `/receipts/${receiptId}/points`
    );

    expect(pointsResponse.status).toBe(200);
    expect(pointsResponse.body).toHaveProperty("points");
    expect(pointsResponse.body.points).toBe(109);
  });
});
