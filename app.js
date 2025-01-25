require("dotenv").config(); // Load environment variables
const express = require("express");
const bodyParser = require("body-parser");
const { Server } = require("socket.io");
const mqtt = require("mqtt");
const http = require("http");
const cors = require("cors");
const { queryDatabase } = require("./db"); // Ganti dengan path ke file koneksi database
const createDataTable = require("./dataDB");

createDataTable();

// App setup
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins for testing. Restrict this in production.
  },
});

// Load configuration from .env
const PORT = process.env.PORT || 3000;
const MQTT_BROKER = process.env.MQTT_BROKER;

// MQTT client setup
const mqttClient = mqtt.connect(MQTT_BROKER);
const MQTT_TOPICS = {
  STATUS: "aligndanalyze/status/#", // example: habito/status/habito_001
  LIGHT: "aligndanalyze/data/#", // example: habito/light/green/habito_001
};

let userStatus = {};

// MQTT event listeners
mqttClient.on("connect", () => {
  console.log("Connected to MQTT broker");
  mqttClient.subscribe(Object.values(MQTT_TOPICS), (err) => {
    if (!err) {
      console.log(`Subscribed to topics: ${Object.values(MQTT_TOPICS)}`);
    }
  });
});

// Function to calculate the average data value for a specific customID
async function calculateAverage(customID) {
  const averageQuery = `
    SELECT AVG(data) AS average
    FROM data
    WHERE customID = ?
  `;

  try {
    const result = await queryDatabase(averageQuery, [customID]);
    if (result && result[0]) {
      return result[0].average || 0;
    }
    return 0; // Default jika tidak ada data
  } catch (error) {
    console.error("Error calculating average:", error);
    return 0;
  }
}

async function handleData(customId, payload) {
  const { topic, message } = payload;

  const topicParts = topic.split("/");
  const customID = topicParts[2] || "unknown";
  const data = message.toString();

  if (userStatus[customId]) {
    io.to(userStatus[customId].socketId).emit("data", { customID, data });
    console.log(`Data sent to user: ${customId}`);
  } else {
    console.log(`User with customId: ${customId} not found.`);
  }

  const checkQuery = `
        SELECT COUNT(*) AS count 
        FROM data 
        WHERE customID = ? 
          AND data = ? 
          AND DATE(time) = CURDATE()`;
  const insertQuery = "INSERT INTO data (customID, data) VALUES (?, ?)";

  // const result = await queryDatabase(checkQuery, [username, color]);
  await queryDatabase(insertQuery, [customID, data]);
}

mqttClient.on("message", (topic, message) => {
  const filterTopic = topic.split("/")[1];
  const customId = topic.split("/").pop();
  const payload = { topic, message: message.toString() };

  if (filterTopic === "status") {
    // handleStatusMessage(customId, payload);
    console.log(customId, payload);
  } else if (filterTopic === "data") {
    // handleLightMessage(customId, payload);
    handleData(customId, payload);
    console.log(payload.message);
  }
});

// WebSocket event listeners
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);
  let customId = null;

  socket.on("set-custom-id", async (id) => {
    customId = id;
    if (!userStatus[customId]) {
      userStatus[customId] = {};
    }
    userStatus[customId].socketId = socket.id;
    console.log(`User ${customId} connected`);
    try {
      const average = await calculateAverage(customId);
      socket.emit("average-data", { customID: customId, average });
      console.log(`Average data sent to user ${customId}: ${average}`);
    } catch (error) {
      console.error("Error sending average data:", error);
      socket.emit("error", { message: "Failed to calculate average" });
    }
    // resetUserTimeout(customId);
  });

  socket.on("disconnect", () => {
    if (customId) {
      console.log(`User ${customId} disconnected`);
      delete userStatus[customId];
      //   clearTimeout(userTimeouts[customId]);
    }
  });
});

// Express middleware
app.use(cors());
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("MQTT Backend is running");
});

// Start server
server.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
