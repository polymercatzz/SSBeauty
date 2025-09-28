const express = require("express");

const userRoutes = require("./routes/userRoute"); // import routes user

const path = require("path");

const port = 3000;

const app = express();


// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Set EJS
app.set('view engine', 'ejs');
// Set public directory
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use("/users", userRoutes);

// Main route
app.get("/", (req, res) => {
    res.send('Home SSbeauty');
})

app.get("/login", (req, res) => {
    res.send('login SSbeauty');
})

app.post("/logout", (req, res) => {
    res.send('logout SSbeauty');
})
app.listen(port, () =>{
    console.log("The server was running on : http://localhost:3000");
})