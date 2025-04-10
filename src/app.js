const express = require("express");
const app = express();
const  receiptRoutes = require('./routes/receiptRoutes');
app.use(express.json());



app.get("/health", (req, res) => {
    res.status(200).json({status: "ok"});
});

app.get("/", (req, res) => {
    res.send("Receipt processor backend server is running!");
});


app.use('/receipts', receiptRoutes);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res
        .status(500)
        .json({ error: "<ERROR> Something went wrong with the server!" });
});

const PORT = 3000;


const startServer = async () => {
    try {
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start server: ", error);
        process.exit(1);
    }
};

startServer();