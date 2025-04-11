const calculateAlphanumbericPoints = (retailer) => {
  if (!retailer) return 0;
  let match = retailer.match(/[a-zA-Z0-9]/g);
  return match ? match.length : 0;
};

const checkRoundDollarAmount = (total) => {
  const amount = parseFloat(total);
  if (amount === Math.floor(amount)) {
    return 50;
  }

  return 0;
};

const calculatePointsForTotalMultiple = (total) => {
  const amount = parseFloat(total);
  if (Math.round(amount * 100) % 25 === 0) {
    return 25;
  }

  return 0;
};

const calculatePointsForItems = (items) => {
  let pairs = Math.floor(items.length / 2);
  return pairs * 5;
};

const calculatePointsForDescription = (items) => {
  let result = 0;
  let price = 0;
  items.forEach((item) => {
    const trimmedDescription = item.shortDescription.trim();
    if (trimmedDescription.length % 3 === 0) {
      price = parseFloat(item.price);
      result += Math.ceil(price * 0.2);
    }
  });

  return result;
};

const calcluatePointsForPurchaseDate = (purchaseDate) => {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(purchaseDate)) {
    return 0;
  }

  const date = new Date(purchaseDate);
  if (isNaN(date.getTime())) {
    return 0;
  }
  const day = parseInt(purchaseDate.split("-")[2]);
  if (day % 2 !== 0) {
    return 6;
  }

  return 0;
};

const calculatePointsForPurchaseTime = (purchaseTime) => {
  const timeRegex = /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/;
  if (!timeRegex.test(purchaseTime)) {
    return 0;
  }

  const [hours, minutes] = purchaseTime.split(":").map(Number);

  const convertedToMinutes = hours * 60 + minutes;

  if (convertedToMinutes > 840 && convertedToMinutes < 960) {
    return 10;
  }

  return 0;
};

const calculatePoints = (receipt) => {
  if (!receipt) {
    throw new Error("Receipt is required");
  }

  const { retailer, purchaseDate, purchaseTime, items, total } = receipt;

  if (!retailer || retailer.trim() === "") {
    throw new Error("Please provide a retailer name of at least 1 character");
  }

  if (!purchaseDate) {
    throw new Error("Please provide a purchase date in the format YYYY-MM-DD");
  }

  if (!purchaseTime) {
    throw new Error("Please provide a purchase time in the format HH:MM");
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new Error("Please provide at least one item");
  }

  if (!total) {
    throw new Error("Please provide a total amount in the format 0.00");
  }

  let points = 0;

  points += calculateAlphanumbericPoints(retailer);
  points += checkRoundDollarAmount(total);
  points += calculatePointsForTotalMultiple(total);
  points += calculatePointsForItems(items);
  points += calculatePointsForDescription(items);
  points += calcluatePointsForPurchaseDate(purchaseDate);
  points += calculatePointsForPurchaseTime(purchaseTime);

  return { points };
};

module.exports = {
  calculatePoints,
};
