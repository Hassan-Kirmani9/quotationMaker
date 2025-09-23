const express = require("express");
const cors = require("cors");
const app = express();

let uuidv4;
(async () => {
  const { v4 } = await import("uuid");
  uuidv4 = v4;
})();

const authRoutes = require("./routes/auth");
const clientRoutes = require("./routes/clients");
const productRoutes = require("./routes/products");
const configurationRoutes = require("./routes/configuration");
const quotationRoutes = require("./routes/quotations");
const sizeRoutes = require("./routes/size");
const tenantRoutes = require("./routes/tenant");
const dashboardRoutes = require("./routes/dashboard");
const cateringQuotationRoutes = require("./routes/cateringQuotations");

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use("/uploads", express.static("uploads"));

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Quotation Maker API is running!",
    timestamp: new Date().toISOString(),
  });
});

app.use((req, res, next) => {
  const correlationId = req.headers["x-correlation-id"] || (uuidv4 ? uuidv4() : Math.random().toString(36));
  req.correlationId = correlationId;
  res.setHeader("x-correlation-id", correlationId);
  next();
});

app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/products", productRoutes);
app.use("/api/configuration", configurationRoutes);
app.use("/api/quotations", quotationRoutes);
app.use('/api/catering-quotations', cateringQuotationRoutes);
app.use("/api/sizes", sizeRoutes);
app.use("/api/tenants", tenantRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.use((err, req, res, next) => {
  console.error(`[${req.correlationId}]`, err);
  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error",
    error: err,
  });
});

module.exports = app;