require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose"); 
const nutriByteRoutes = require('./routes/NutriByteRoutes');
const path = require("path");
const app = express();
const port = 3000;
const { cache, loadCategories, loadNutrients } = require('./modules/cache');


// Serve static files (like images) from the 'public' directory
app.use(express.static(path.join(__dirname, "public")));

// Set up the 'views' directory for your HTML files
app.set("views", path.join(__dirname, "views"));

// Handle the index route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

// Connect to MongoDB.  Note, the URL is obtained from the .env file. 
const uri = process.env.MONGODB_URI;

mongoose.connect(uri, {
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
loadCategories(); 
loadNutrients();

app.use('/', nutriByteRoutes);

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
