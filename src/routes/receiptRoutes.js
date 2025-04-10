const express = require('express');
const receiptRouter = express.Router();
const { v4: uuidv4 } = require('uuid');
const { calculatePoints } = require('../services/pointsCalculationService');
const receiptMemory = {};
const pointsCache = {};

receiptRouter.post('/process', async(req, res) => {
    try {

        const receiptData = req.body;

        if (!receiptData.retailer || !receiptData.purchaseDate || !receiptData.purchaseTime || !receiptData.items || !receiptData.total) {
            return res.status(400).json({ error: "Invalid receipt data, missing fields"});
        }

        const id = uuidv4();
        receiptMemory[id] = receiptData;

        return res.status(200).json({ id });

    } catch (error) {
        console.error('Process error: ', error);
        res.status(500).json({ error: 'Internal serval error during receipt processing'});
    }
})

receiptRouter.get('/:id/points', async(req, res) => {
    try {
      const { id } = req.params;
      
      if (!receiptMemory[id]) {
        return res.status(404).json({ error: "Receipt not found" });
      }

      if (pointsCache[id]) {
        return res.status(200).json({ points: pointsCache[id], message: "Points value returned from cache" });  
      }
      

      const points = calculatePoints(receiptMemory[id]);

      pointsCache[id] = points;

      return res.status(200).json({ points: points }); 
    } catch (error) {
      console.error('Points calculation error: ', error);
      res.status(500).json({ error: "Internal server error during points calculation" });
    }
  });






module.exports = receiptRouter;