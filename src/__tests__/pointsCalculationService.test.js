const { calculatePoints } = require("../services/pointsCalculationService");

describe("Points Calculation Service", () => {
  test("calculates points for retailer name characters", () => {
    const receipt = {
      retailer: "Target",
      purchaseDate: "2022-01-01",
      purchaseTime: "13:01",
      items: [
        {
          shortDescription: "Mountain Dew 12PK",
          price: "6.49",
        },
        {
          shortDescription: "Emils Cheese Pizza",
          price: "12.25",
        },
        {
          shortDescription: "Knorr Creamy Chicken",
          price: "1.26",
        },
        {
          shortDescription: "Doritos Nacho Cheese",
          price: "3.35",
        },
        {
          shortDescription: "   Klarbrunn 12-PK 12 FL OZ  ",
          price: "12.00",
        },
      ],
      total: "35.35",
    };

    const result = calculatePoints(receipt);
    expect(result.points).toBeGreaterThanOrEqual(28);
  });

  test("calculates points correctly for item descriptions", () => {
    const receipt = {
      retailer: "M",
      purchaseDate: "2022-01-01",
      purchaseTime: "13:01",
      items: [
        { shortDescription: "Milk", price: "4.50" },
        { shortDescription: "Bread", price: "3.00" },
      ],
      total: "7.50",
    };

    const result = calculatePoints(receipt);
    expect(result.points).toBeGreaterThanOrEqual(0);

    const receipt2 = {
      retailer: "M",
      purchaseDate: "2022-01-01",
      purchaseTime: "13:01",
      items: [{ shortDescription: "ABC", price: "5.00" }],
      total: "5.00",
    };

    const result2 = calculatePoints(receipt2);
    expect(result2.points).toBeGreaterThanOrEqual(1);
  });

  test("calculates full points for complete example receipt", () => {
    const receipt = {
      retailer: "Target",
      purchaseDate: "2022-01-01",
      purchaseTime: "13:01",
      items: [
        { shortDescription: "Mountain Dew 12PK", price: "6.49" },
        { shortDescription: "Emils Cheese Pizza", price: "12.25" },
        { shortDescription: "Knorr Creamy Chicken", price: "1.26" },
        { shortDescription: "Doritos Nacho Cheese", price: "3.35" },
        { shortDescription: "   Klarbrunn 12-PK 12 FL OZ  ", price: "12.00" },
      ],
      total: "35.35",
    };

    const result = calculatePoints(receipt);
    expect(result.points).toBe(28);
  });

  describe("Mutation Tests - Required Fields Validation", () => {
    test("throws error for empty retailer name", () => {
      const receipt = {
        retailer: "",
        purchaseDate: "2022-01-01",
        purchaseTime: "13:01",
        items: [{ shortDescription: "Item", price: "5.00" }],
        total: "5.00",
      };

      expect(() => calculatePoints(receipt)).toThrow(
        "Please provide a retailer name of at least 1 character"
      );
    });

    test("throws error for missing retailer", () => {
      const receipt = {
        purchaseDate: "2022-01-01",
        purchaseTime: "13:01",
        items: [{ shortDescription: "Item", price: "5.00" }],
        total: "5.00",
      };

      expect(() => calculatePoints(receipt)).toThrow(
        "Please provide a retailer name of at least 1 character"
      );
    });

    test("throws error for missing purchase date", () => {
      const receipt = {
        retailer: "Target",
        purchaseTime: "13:01",
        items: [{ shortDescription: "Item", price: "5.00" }],
        total: "5.00",
      };

      expect(() => calculatePoints(receipt)).toThrow(
        "Please provide a purchase date in the format YYYY-MM-DD"
      );
    });

    test("throws error for missing purchase time", () => {
      const receipt = {
        retailer: "Target",
        purchaseDate: "2022-01-01",
        items: [{ shortDescription: "Item", price: "5.00" }],
        total: "5.00",
      };

      expect(() => calculatePoints(receipt)).toThrow(
        "Please provide a purchase time in the format HH:MM"
      );
    });

    test("throws error for missing items", () => {
      const receipt = {
        retailer: "Target",
        purchaseDate: "2022-01-01",
        purchaseTime: "13:01",
        total: "5.00",
      };

      expect(() => calculatePoints(receipt)).toThrow(
        "Please provide at least one item"
      );
    });

    test("throws error for empty items array", () => {
      const receipt = {
        retailer: "Target",
        purchaseDate: "2022-01-01",
        purchaseTime: "13:01",
        items: [],
        total: "5.00",
      };

      expect(() => calculatePoints(receipt)).toThrow(
        "Please provide at least one item"
      );
    });

    test("throws error for missing total", () => {
      const receipt = {
        retailer: "Target",
        purchaseDate: "2022-01-01",
        purchaseTime: "13:01",
        items: [{ shortDescription: "Item", price: "5.00" }],
      };

      expect(() => calculatePoints(receipt)).toThrow(
        "Please provide a total amount in the format 0.00"
      );
    });

    test("throws error for null receipt", () => {
      expect(() => calculatePoints(null)).toThrow("Receipt is required");
    });
  });

  describe("Mutation Tests - Retailer Name", () => {
    test("handles special characters in retailer name", () => {
      const receipt = {
        retailer: "!@#$%^&*()",
        purchaseDate: "2022-01-01",
        purchaseTime: "13:01",
        items: [{ shortDescription: "Item", price: "5.00" }],
        total: "5.00",
      };

      const result = calculatePoints(receipt);
      expect(result.points).toBeGreaterThanOrEqual(0);

      const receipt2 = {
        retailer: "Store123!@#",
        purchaseDate: "2022-01-01",
        purchaseTime: "13:01",
        items: [{ shortDescription: "Item", price: "5.00" }],
        total: "5.00",
      };

      const result2 = calculatePoints(receipt2);
      expect(result2.points).toBeGreaterThan(result.points - 10);
    });
  });

  describe("Mutation Tests - Total Amount", () => {
    test("checks round dollar amount points", () => {
      const receipt = {
        retailer: "Store",
        purchaseDate: "2022-01-01",
        purchaseTime: "13:01",
        items: [{ shortDescription: "Item", price: "100.00" }],
        total: "100.00",
      };

      const result = calculatePoints(receipt);
      expect(result.points).toBeGreaterThanOrEqual(50);

      const receipt2 = {
        retailer: "Store",
        purchaseDate: "2022-01-01",
        purchaseTime: "13:01",
        items: [{ shortDescription: "Item", price: "100.01" }],
        total: "100.01",
      };

      const result2 = calculatePoints(receipt2);
      expect(result2.points).toBeLessThan(result.points);
    });

    test("checks multiples of 0.25 points", () => {
      const receipt = {
        retailer: "Store",
        purchaseDate: "2022-01-01",
        purchaseTime: "13:01",
        items: [{ shortDescription: "Item", price: "10.75" }],
        total: "10.75",
      };

      const result = calculatePoints(receipt);
      expect(result.points).toBeGreaterThanOrEqual(25);

      const receipt2 = {
        retailer: "Store",
        purchaseDate: "2022-01-01",
        purchaseTime: "13:01",
        items: [{ shortDescription: "Item", price: "10.76" }],
        total: "10.76",
      };

      const result2 = calculatePoints(receipt2);
      expect(result2.points).toBeLessThan(result.points);
    });

    test("checks both round dollar and multiple of 0.25", () => {
      const receipt = {
        retailer: "Store",
        purchaseDate: "2022-01-01",
        purchaseTime: "13:01",
        items: [{ shortDescription: "Item", price: "25.00" }],
        total: "25.00",
      };

      const result = calculatePoints(receipt);
      expect(result.points).toBeGreaterThanOrEqual(75);
    });
  });

  describe("Mutation Tests - Items", () => {
    test("checks number of items points calculation", () => {
      const receipt = {
        retailer: "Store",
        purchaseDate: "2022-01-01",
        purchaseTime: "13:01",
        items: [
          { shortDescription: "Item1", price: "5.00" },
          { shortDescription: "Item2", price: "5.00" },
        ],
        total: "10.00",
      };

      const result = calculatePoints(receipt);

      const receipt2 = {
        retailer: "Store",
        purchaseDate: "2022-01-01",
        purchaseTime: "13:01",
        items: [
          { shortDescription: "Item1", price: "5.00" },
          { shortDescription: "Item2", price: "5.00" },
          { shortDescription: "Item3", price: "5.00" },
          { shortDescription: "Item4", price: "5.00" },
        ],
        total: "20.00",
      };

      const result2 = calculatePoints(receipt2);
      expect(result2.points - result.points).toBeGreaterThanOrEqual(5);
    });

    test("checks item description length calculation", () => {
      const receipt = {
        retailer: "Store",
        purchaseDate: "2022-01-01",
        purchaseTime: "13:01",
        items: [{ shortDescription: "ABC", price: "5.00" }],
        total: "5.00",
      };

      const result = calculatePoints(receipt);
      expect(result.points).toBeGreaterThanOrEqual(1);

      const receipt2 = {
        retailer: "Store",
        purchaseDate: "2022-01-01",
        purchaseTime: "13:01",
        items: [{ shortDescription: "ABCDEF", price: "5.00" }],
        total: "5.00",
      };

      const result2 = calculatePoints(receipt2);
      expect(result2.points).toBeGreaterThanOrEqual(1);

      const receipt3 = {
        retailer: "Store",
        purchaseDate: "2022-01-01",
        purchaseTime: "13:01",
        items: [{ shortDescription: "ABCD", price: "5.00" }],
        total: "5.00",
      };

      const result3 = calculatePoints(receipt3);
      expect(result3.points).toBeLessThan(result2.points);
    });
  });

  describe("Mutation Tests - Date and Time", () => {
    test("checks odd day calculation", () => {
      const receipt = {
        retailer: "Store",
        purchaseDate: "2022-01-01",
        purchaseTime: "13:01",
        items: [{ shortDescription: "Item", price: "5.00" }],
        total: "5.00",
      };

      const basePoints = calculatePoints(receipt).points;

      const receipt2 = {
        retailer: "Store",
        purchaseDate: "2022-01-03",
        purchaseTime: "13:01",
        items: [{ shortDescription: "Item", price: "5.00" }],
        total: "5.00",
      };

      const oddDayPoints = calculatePoints(receipt2).points;

      expect(oddDayPoints).toBeGreaterThanOrEqual(basePoints);
    });

    test("checks purchase time between 2PM and 4PM", () => {
      const receipt = {
        retailer: "Store",
        purchaseDate: "2022-01-01",
        purchaseTime: "14:01",
        items: [{ shortDescription: "Item", price: "5.00" }],
        total: "5.00",
      };

      const result = calculatePoints(receipt);

      const receipt2 = {
        retailer: "Store",
        purchaseDate: "2022-01-01",
        purchaseTime: "13:01",
        items: [{ shortDescription: "Item", price: "5.00" }],
        total: "5.00",
      };

      const result2 = calculatePoints(receipt2);
      expect(result.points - result2.points).toBe(10);
    });

    test("handles invalid date format", () => {
      const receipt = {
        retailer: "Store",
        purchaseDate: "invalid-date",
        purchaseTime: "13:01",
        items: [{ shortDescription: "Item", price: "5.00" }],
        total: "5.00",
      };

      const result = calculatePoints(receipt);
      expect(result.points).toBeGreaterThanOrEqual(0);
    });

    test("handles invalid time format", () => {
      const receipt = {
        retailer: "Store",
        purchaseDate: "2022-01-01",
        purchaseTime: "invalid-time",
        items: [{ shortDescription: "Item", price: "5.00" }],
        total: "5.00",
      };

      const result = calculatePoints(receipt);
      expect(result.points).toBeGreaterThanOrEqual(0);
    });
  });

  describe("Mutation Tests - Combined Rules", () => {
    test("calculates correct points for M&M Corner Market example", () => {
      const receipt = {
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
      };

      const result = calculatePoints(receipt);
      expect(result.points).toBe(109);
    });

    test("checks multiple rules apply correctly", () => {
      const receipt = {
        retailer: "SuperMart123",
        purchaseDate: "2022-01-23",
        purchaseTime: "15:30",
        items: [
          { shortDescription: "ABC", price: "10.00" },
          { shortDescription: "DEF", price: "15.00" },
          { shortDescription: "GHI", price: "25.00" },
          { shortDescription: "JKL", price: "25.00" },
        ],
        total: "75.00",
      };

      const result = calculatePoints(receipt);

      expect(result.points).toBe(128);
    });
  });
});
