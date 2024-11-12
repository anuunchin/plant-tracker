const express = require("express");
const plantsRoutes = require("./routes/plantsRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static("frontend"));
app.use(plantsRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
