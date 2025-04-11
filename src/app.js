const express = require("express");
const app = express();
const receiptRoutes = require("./routes/receiptRoutes");
app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.get("/", (req, res) => {
  res.send("Receipt processor backend server is running!");
});

app.use("/receipts", receiptRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(500)
    .json({ error: { message: "Something went wrong with the server!" } });
});

const PORT = process.env.PORT || 3000;

const startServer = async (port = PORT) => {
  try {
    const server = app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
    return server;
  } catch (error) {
    console.error("Failed to start server: ", error);
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
