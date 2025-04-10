const calculateAlphanumbericPoints = (retailer) => {
    if (!retailer) return 0;
    let match = retailer.match(/[a-zA-Z0-9]/g);
    return match ? match.length : 0;
}

const checkRoundDollarAmount = (total) => {
    const amount = parseFloat(total);
    if (amount === Math.floor(amount)) {
        return 50;
    }

    return 0;
}

const calculatePointsForTotalMultiple = (total) => {
    const amount = parseFloat(total);
    if (Math.round(amount * 100) % 25 === 0) {
      return 25;
    }

    return 0;
}

const calculatePointsForItems = (items) => {
    let pairs = Math.floor(items.length / 2);
    return pairs * 5;
}

const calculatePointsForDescription = (items) => {
    let result = 0;
    let price = 0;
    items.forEach(item => {
        const trimmedDescription = item.shortDescription.trim();
        if (trimmedDescription.length % 3 === 0) {
            price = parseFloat(item.price);
            result += Math.ceil(price * 0.2);
        };
    })

    return result;
}

const calcluatePointsForPurchaseDate = (purchaseDate) => {
    if (!purchaseDate) {
        return console.error("Error during rule 6, purchase date missing.")
    }
    const day = parseInt(purchaseDate.split('-')[2]);
    if (day % 2 !== 0) {
        return 6;
    }

    return 0;
}

const calculatePointsForPurchaseTime = (purchaseTime) => {
    if (!purchaseTime) {
        return console.error("Purchase time missing")
    }
    const [hours, minutes] = purchaseTime.split(':').map(Number);

    const convertedToMinutes = hours * 60 + minutes;

    if (convertedToMinutes > 840 && convertedToMinutes < 960) {
        return 10;
    }

    return 0;
}

const calculatePoints = (receipt) => {
    let points = 0;
    const { retailer, purchaseDate, purchaseTime, items, total } = receipt;

    points += calculateAlphanumbericPoints(retailer);

    points += checkRoundDollarAmount(total);
    points += calculatePointsForTotalMultiple(total);

    points += calculatePointsForItems(items);
    points += calculatePointsForDescription(items);

    points += calcluatePointsForPurchaseDate(purchaseDate);
    points += calculatePointsForPurchaseTime(purchaseTime);

    return points;
}

module.exports = {
    calculatePoints
};