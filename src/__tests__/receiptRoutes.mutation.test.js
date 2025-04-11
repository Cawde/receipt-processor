const request = require("supertest");
const express = require("express");
const receiptRoutes = require("../routes/receiptRoutes");

describe("Receipt Routes Mutation Tests", () => {
  let app;
  let validReceipt;
  let receiptId;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use("/receipts", receiptRoutes);

    validReceipt = {
      retailer: "Target",
      purchaseDate: "2022-01-01",
      purchaseTime: "13:01",
      items: [
        { shortDescription: "Mountain Dew 12PK", price: "6.49" },
        { shortDescription: "Emils Cheese Pizza", price: "12.25" },
      ],
      total: "18.74",
    };
  });

  describe("POST /receipts/process - Input Mutations", () => {
    test("handles missing retailer field", async () => {
      const mutatedReceipt = { ...validReceipt };
      delete mutatedReceipt.retailer;

      const response = await request(app)
        .post("/receipts/process")
        .send(mutatedReceipt);

      expect(response.status).toBe(400);
      expect(response.body.error.message).toBe(
        "Please provide a retailer name of at least 1 character"
      );
    });

    test("handles empty retailer field", async () => {
      const mutatedReceipt = {
        ...validReceipt,
        retailer: "  ",
      };

      const response = await request(app)
        .post("/receipts/process")
        .send(mutatedReceipt);

      expect(response.status).toBe(400);
      expect(response.body.error.message).toBe(
        "Please provide a retailer name of at least 1 character"
      );
    });

    test("handles missing purchaseDate field", async () => {
      const mutatedReceipt = { ...validReceipt };
      delete mutatedReceipt.purchaseDate;

      const response = await request(app)
        .post("/receipts/process")
        .send(mutatedReceipt);

      expect(response.status).toBe(400);
      expect(response.body.error.message).toBe(
        "Please provide a purchase date in the format YYYY-MM-DD"
      );
    });

    test("handles missing purchaseTime field", async () => {
      const mutatedReceipt = { ...validReceipt };
      delete mutatedReceipt.purchaseTime;

      const response = await request(app)
        .post("/receipts/process")
        .send(mutatedReceipt);

      expect(response.status).toBe(400);
      expect(response.body.error.message).toBe(
        "Please provide a purchase time in the format HH:MM"
      );
    });

    test("handles missing items field", async () => {
      const mutatedReceipt = { ...validReceipt };
      delete mutatedReceipt.items;

      const response = await request(app)
        .post("/receipts/process")
        .send(mutatedReceipt);

      expect(response.status).toBe(400);
      expect(response.body.error.message).toContain(
        "Please provide at least one item"
      );
    });

    test("rejects empty items array", async () => {
      const mutatedReceipt = { ...validReceipt, items: [] };

      const response = await request(app)
        .post("/receipts/process")
        .send(mutatedReceipt);

      expect(response.status).toBe(400);
      expect(response.body.error.message).toContain(
        "Please provide at least one item"
      );
    });

    test("handles missing total field", async () => {
      const mutatedReceipt = { ...validReceipt };
      delete mutatedReceipt.total;

      const response = await request(app)
        .post("/receipts/process")
        .send(mutatedReceipt);

      expect(response.status).toBe(400);
      expect(response.body.error.message).toBe(
        "Please provide a total amount in the format 0.00"
      );
    });

    test("handles malformed item in items array", async () => {
      const mutatedReceipt = {
        ...validReceipt,
        items: [
          { shortDescription: "Mountain Dew 12PK", price: "6.49" },
          {
            description: "Missing short description field",
            cost: "Missing price field",
          },
        ],
      };

      const response = await request(app)
        .post("/receipts/process")
        .send(mutatedReceipt);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("id");
    });
  });

  describe("GET /receipts/:id/points - ID Mutations", () => {
    beforeEach(async () => {
      const response = await request(app)
        .post("/receipts/process")
        .send(validReceipt);

      receiptId = response.body.id;
    });

    test("handles non-existent ID", async () => {
      const response = await request(app).get(
        "/receipts/non-existent-id/points"
      );

      expect(response.status).toBe(404);
    });

    test("handles malformed UUID", async () => {
      const response = await request(app).get("/receipts/not-a-uuid/points");

      expect(response.status).toBe(404);
    });

    test("handles empty ID", async () => {
      const response = await request(app).get("/receipts//points");

      expect(response.status).toBe(404);
    });

    test("handles cached points retrieval", async () => {
      const response1 = await request(app).get(`/receipts/${receiptId}/points`);

      expect(response1.status).toBe(200);
      expect(response1.body).toHaveProperty("points");

      const response2 = await request(app).get(`/receipts/${receiptId}/points`);

      expect(response2.status).toBe(200);
      expect(response2.body).toHaveProperty("points");
      expect(response2.body.points).toBe(response1.body.points);
    });
  });

  describe("Error Handling Mutations", () => {
    test("handles JSON parsing errors", async () => {
      const response = await request(app)
        .post("/receipts/process")
        .set("Content-Type", "application/json")
        .send('{"retailer": "Target", invalid json}');

      expect(response.status).toBe(400);
    });

    test("handles empty request body", async () => {
      const response = await request(app).post("/receipts/process").send({});

      expect(response.status).toBe(400);
    });

    test("handles null values in required fields", async () => {
      const mutatedReceipt = {
        retailer: null,
        purchaseDate: null,
        purchaseTime: null,
        items: null,
        total: null,
      };

      const response = await request(app)
        .post("/receipts/process")
        .send(mutatedReceipt);

      expect(response.status).toBe(400);
    });
  });
});
