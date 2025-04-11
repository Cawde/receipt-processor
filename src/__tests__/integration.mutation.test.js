const request = require("supertest");
const { app, startServer } = require("../app.js");

describe("Receipt Processor Integration Mutation Tests", () => {
  let server;
  const TEST_PORT = 4001;

  beforeAll(async () => {
    server = await startServer(TEST_PORT);
  });

  afterAll(async () => {
    if (server) {
      await server.close();
    }
  });

  describe("Complex Receipt Processing Scenarios", () => {
    test("processes multiple receipts with unique IDs", async () => {
      const receipt1 = {
        retailer: "Walgreens",
        purchaseDate: "2022-01-02",
        purchaseTime: "08:13",
        items: [
          { shortDescription: "Advil 24ct", price: "9.99" },
          { shortDescription: "Bandages", price: "4.29" },
        ],
        total: "14.28",
      };

      const receipt2 = {
        retailer: "Target",
        purchaseDate: "2022-01-01",
        purchaseTime: "13:01",
        items: [
          { shortDescription: "Mountain Dew 12PK", price: "6.49" },
          { shortDescription: "Emils Cheese Pizza", price: "12.25" },
        ],
        total: "18.74",
      };

      const response1 = await request(app)
        .post("/receipts/process")
        .send(receipt1);

      const response2 = await request(app)
        .post("/receipts/process")
        .send(receipt2);

      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);
      expect(response1.body.id).not.toBe(response2.body.id);

      const pointsResponse1 = await request(app).get(
        `/receipts/${response1.body.id}/points`
      );

      const pointsResponse2 = await request(app).get(
        `/receipts/${response2.body.id}/points`
      );

      expect(pointsResponse1.status).toBe(200);
      expect(pointsResponse2.status).toBe(200);
      expect(pointsResponse1.body.points).not.toBe(pointsResponse2.body.points);
    });

    test("handles concurrent receipt processing", async () => {
      const receipt = {
        retailer: "Target",
        purchaseDate: "2022-01-01",
        purchaseTime: "13:01",
        items: [
          { shortDescription: "Mountain Dew 12PK", price: "6.49" },
          { shortDescription: "Emils Cheese Pizza", price: "12.25" },
        ],
        total: "18.74",
      };

      const promises = Array(5)
        .fill()
        .map(() => request(app).post("/receipts/process").send(receipt));

      const responses = await Promise.all(promises);

      responses.forEach((response) => {
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("id");
      });

      const ids = responses.map((r) => r.body.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(5);
    });
  });

  describe("Boundary Testing", () => {
    test("handles very large receipt", async () => {
      const items = Array(100)
        .fill()
        .map((_, i) => ({
          shortDescription: `Item ${i}`,
          price: "1.00",
        }));

      const largeReceipt = {
        retailer: "Mega Store",
        purchaseDate: "2022-01-01",
        purchaseTime: "13:01",
        items,
        total: "100.00",
      };

      const response = await request(app)
        .post("/receipts/process")
        .send(largeReceipt);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("id");

      const pointsResponse = await request(app).get(
        `/receipts/${response.body.id}/points`
      );

      expect(pointsResponse.status).toBe(200);
      expect(pointsResponse.body).toHaveProperty("points");
      expect(pointsResponse.body.points).toBeGreaterThan(0);
    });

    test("handles receipts with extreme values", async () => {
      const extremeReceipt = {
        retailer: "X".repeat(1000),
        purchaseDate: "2022-01-01",
        purchaseTime: "13:01",
        items: [
          {
            shortDescription: "X".repeat(1000),
            price: "999999.99",
          },
        ],
        total: "999999.99",
      };

      const response = await request(app)
        .post("/receipts/process")
        .send(extremeReceipt);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("id");

      const pointsResponse = await request(app).get(
        `/receipts/${response.body.id}/points`
      );

      expect(pointsResponse.status).toBe(200);
      expect(pointsResponse.body).toHaveProperty("points");
    });
  });

  describe("System Health and Performance", () => {
    test("health endpoint returns success", async () => {
      const response = await request(app).get("/health");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("status", "ok");
    });

    test("root endpoint returns welcome message", async () => {
      const response = await request(app).get("/");

      expect(response.status).toBe(200);
      expect(response.text).toContain("Receipt processor");
    });

    test("handles invalid routes", async () => {
      const response = await request(app).get("/invalid-route");

      expect(response.status).toBe(404);
    });
  });
});
