const pool = require("./../db");
const bcrypt = require('bcrypt');


exports.login = (req, res) => {
  res.render("login");
};
exports.signup = async (req, res) => {
  try{
    if (req.method === "POST") {
      console.log("Process Signup", req.body);
  
      const email = req.body.email;
      const hashedPassword = await bcrypt.hash(req.body.password, 10)
      console.log(hashedPassword)
  
      const result = await pool.query(
        "INSERT INTO users (email, password) VALUES ($1, $2)",
        [email, hashedPassword]
      );
      await pool.end();
  
      res.send("User added successfully");
      res.redirect("/login");
    } else {
  
        res.render("signup");
    }
  } catch {
    res.status(400).send()
  }

  
};

