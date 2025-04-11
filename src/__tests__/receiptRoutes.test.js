const request = require('supertest');
const express = require('express');
const receiptRoutes = require('../routes/receiptRoutes');

const app = express();
app.use(express.json());
app.use('/receipts', receiptRoutes);

describe('Receipt API Routes', () => {
  let receiptId;

  test('POST /receipts/process - creates a receipt and returns ID', async () => {
    const response = await request(app)
      .post('/receipts/process')
      .send({
        retailer: 'Target',
        purchaseDate: '2022-01-01',
        purchaseTime: '13:01',
        items: [
          { shortDescription: 'Mountain Dew 12PK', price: '6.49' },
          { shortDescription: 'Emils Cheese Pizza', price: '12.25' }
        ],
        total: '18.74'
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id');
    receiptId = response.body.id;
  });

  test('GET /receipts/:id/points - returns points for a receipt', async () => {
    if (!receiptId) {
      throw new Error('Receipt ID not found');
    }

    const response = await request(app)
      .get(`/receipts/${receiptId}/points`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('points');
    expect(typeof response.body.points).toBe('number');
  });

  test('GET /receipts/:id/points - returns 404 for invalid ID', async () => {
    const response = await request(app)
      .get('/receipts/invalid-id/points');

    expect(response.status).toBe(404);
  });

  test('POST /receipts/process - returns 400 for invalid receipt', async () => {
    const response = await request(app)
      .post('/receipts/process')
      .send({
        retailer: 'Target'
      });

    expect(response.status).toBe(400);
  });
});