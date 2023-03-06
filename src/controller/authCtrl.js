const pool = require("./../db");

exports.login = (req, res) => {
  res.render("login");
};
exports.signup = async (req, res) => {
  if (req.method === "POST") {
    console.log("Process Signup", req.body);
    const email = req.body.email;
    const password = req.body.password;

    const result = await pool.query(
      "INSERT INTO users (email, password) VALUES ($1, $2)",
      [email, password]
    );
    await pool.end();

    res.send("User added successfully");
  } else {

      res.render("signup");
  }
};
// exports.processSignup = async (req, res) => {};
