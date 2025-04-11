const express = require("express");
const receiptRouter = express.Router();
const { v4: uuidv4 } = require("uuid");
const { calculatePoints } = require("../services/pointsCalculationService");
const receiptMemory = {};
const pointsCache = {};

receiptRouter.post("/process", async (req, res) => {
  try {
    const receiptData = req.body;

    // Validate required fields
    if (!receiptData) {
      return res.status(400).json({
        error: {
          message: "Receipt is required",
        },
      });
    }

    if (!receiptData.retailer || receiptData.retailer.trim() === "") {
      return res.status(400).json({
        error: {
          message: "Please provide a retailer name of at least 1 character",
        },
      });
    }

    if (!receiptData.purchaseDate) {
      return res.status(400).json({
        error: {
          message: "Please provide a purchase date in the format YYYY-MM-DD",
        },
      });
    }

    if (!receiptData.purchaseTime) {
      return res.status(400).json({
        error: {
          message: "Please provide a purchase time in the format HH:MM",
        },
      });
    }

    if (
      !receiptData.items ||
      !Array.isArray(receiptData.items) ||
      receiptData.items.length === 0
    ) {
      return res.status(400).json({
        error: {
          message: "Please provide at least one item",
        },
      });
    }

    if (!receiptData.total) {
      return res.status(400).json({
        error: {
          message: "Please provide a total amount in the format 0.00",
        },
      });
    }

    const id = uuidv4();
    receiptMemory[id] = receiptData;

    return res.status(200).json({ id });
  } catch (error) {
    console.error("Process error: ", error);
    res.status(500).json({
      error: {
        message: "Internal server error during receipt processing.",
      },
      status: "failure",
    });
  }
});

receiptRouter.get("/:id/points", async (req, res) => {
  try {
    const { id } = req.params;

    if (!receiptMemory[id]) {
      return res.status(404).json({ error: "Receipt not found" });
    }

    if (pointsCache[id]) {
      return res.status(200).json({ points: pointsCache[id].points });
    }

    try {
      const points = calculatePoints(receiptMemory[id]);
      pointsCache[id] = points;
      return res.status(200).json({ points: points.points });
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  } catch (error) {
    console.error("Process error: ", error);
    res.status(500).json({
      error: {
        message: "Internal server error during points calculation",
      },
      status: "failure",
    });
  }
});

module.exports = receiptRouter;
