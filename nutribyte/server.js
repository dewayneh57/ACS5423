const express = require("express");
const path = require("path");
const app = express();
const port = 3000;

// Serve static files (like images) from the 'public' directory
app.use(express.static(path.join(__dirname, "public")));

// Set up the 'views' directory for your HTML files
app.set("views", path.join(__dirname, "views"));

// Handle the index route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
