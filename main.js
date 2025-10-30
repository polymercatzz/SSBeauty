require('dotenv').config();

const express = require("express");

const userRoutes = require("./routes/userRoute"); // import routes user
const adminRoutes = require("./routes/adminRoute"); // import routes admin
const empRoutes = require("./routes/empRoute"); // import routes employee

const { sequelize } = require('./models');  // ดึง instance sequelize

const path = require("path");

const PORT = process.env.PORT || 3000;

const app = express();


// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Health check endpoint for ALB
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'healthy',
        timestamp: new Date().toISOString()
    });
});

// Set EJS
app.set('view engine', 'ejs');

// Set public directory
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use("/user", userRoutes);
app.use("/admin", adminRoutes);
app.use("/employee", empRoutes);

// Main route
app.get("/", (req, res) => {
    res.send('Home SSbeauty');
})

app.get("/login", (req, res) => {
    res.send('login SSbeauty');
})

app.get("/logout", (req, res) => {
    res.send('logout SSbeauty');
})


sequelize.sync({ alter: true })
  .then(() => {
    console.log("Database synced");
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server listening on http://0.0.0.0:${PORT}`);
    });
  })
  .catch(err => console.error("DB Error:", err));