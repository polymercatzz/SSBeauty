const { use } = require("../routes/userRoute");

const showMainUser = (req, res) => {
    const username = req.params.username;
    res.send(`Hello, ${username}! Welcome to your user page.`);
}

module.exports = { showMainUser };