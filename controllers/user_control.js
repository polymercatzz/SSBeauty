const { use } = require("../routes/userRoute");

const showMainUser = (req, res) => {
    const username = req.params.username;
    res.render("user_home", { username: username });
}

module.exports = { showMainUser };