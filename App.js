require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose"); 
const path = require("path");

const app = express();
module.exports = app;

const nutriByteRoutes = require('./routes/NutriByteRoutes');
const { 
  cache, 
  loadCategories, 
  loadNutrients, 
  loadBrands, 
  loadOptions 
} = require('./modules/cache');

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "views"));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});
app.use("/", nutriByteRoutes);

const port = process.env.PORT || 3000;
const uri = process.env.MONGODB_URI;

async function startServer() { 
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log("Mongoose connected:");
      //  console.log(mongoose.connection);
      console.log("Host:", mongoose.connection.host);
      console.log("Port:", mongoose.connection.port);
      console.log("Database Name:", mongoose.connection.name);
    }).catch(err => console.error('MongoDB connection error:', err));

    await Promise.all([
      loadCategories(), 
      loadNutrients(),
      loadBrands(),
      loadOptions()
    ]);

    if (require.main === module) {
      app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
      });
    }
  } catch (err) {
    console.error("Error during app initialization:", err);
  }
}

startServer(); 