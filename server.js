const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors"); // Importáld a CORS middleware-t

const app = express();
const port = 3000;
const dataFile = path.join(__dirname, "inactivities.json");

// Middleware
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(cors()); // Engedélyezi a CORS-t, hogy más domain-ekről is elérhesd az API-t

// API Routes
app.get("/api/inactivities", (req, res) => {
  fs.readFile(dataFile, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading data file:", err);
      return res.status(500).send("Error reading data file");
    }
    let inactivities = JSON.parse(data);
    if (req.query.user) {
      inactivities = inactivities.filter(
        (item) => item.user === req.query.user
      );
    }
    res.json(inactivities);
  });
});

app.post("/api/inactivities", (req, res) => {
  fs.readFile(dataFile, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading data file:", err);
      return res.status(500).send("Error reading data file");
    }
    const inactivities = JSON.parse(data);
    const newInactivity = req.body;
    inactivities.push(newInactivity);
    fs.writeFile(dataFile, JSON.stringify(inactivities, null, 2), (err) => {
      if (err) {
        console.error("Error writing data file:", err);
        return res.status(500).send("Error writing data file");
      }
      res.json(newInactivity);
    });
  });
});

app.patch("/api/inactivities/:id", (req, res) => {
  const id = req.params.id;
  const { status } = req.body;

  fs.readFile(dataFile, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading data file:", err);
      return res.status(500).send("Error reading data file");
    }
    const inactivities = JSON.parse(data);
    const index = inactivities.findIndex((item) => item.id === id);
    if (index === -1) {
      return res.status(404).send("Inactivity not found");
    }
    inactivities[index].status = status;
    fs.writeFile(dataFile, JSON.stringify(inactivities, null, 2), (err) => {
      if (err) {
        console.error("Error writing data file:", err);
        return res.status(500).send("Error writing data file");
      }
      res.json(inactivities[index]);
    });
  });
});

app.delete("/api/inactivities/:id", (req, res) => {
  const id = req.params.id;

  fs.readFile(dataFile, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading data file:", err);
      return res.status(500).send("Error reading data file");
    }
    let inactivities = JSON.parse(data);
    const index = inactivities.findIndex((item) => item.id === id);
    if (index === -1) {
      return res.status(404).send("Inactivity not found");
    }
    inactivities.splice(index, 1);
    fs.writeFile(dataFile, JSON.stringify(inactivities, null, 2), (err) => {
      if (err) {
        console.error("Error writing data file:", err);
        return res.status(500).send("Error writing data file");
      }
      res.sendStatus(204); // No Content
    });
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Unexpected error:", err);
  res.status(500).send("Internal Server Error");
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
