
const bcrypt = require('bcrypt');
const { initialize, authenticate } = require("passport");
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');

const authModel = require("../model/authModel")


exports.signup = (req, res) => {
  res.render("signup");
}



exports.signupPass = async (req, res) => {
  try{
    let { email, password, password2 } = req.body;
console.log(req.body)
 let errors = [];

 if ( !email || !password || !password2) {
  errors.push ({message: "Kindly fill all fields"});
 }
 if (password.length < 6){
  errors.push ({message: "Password must be at least 6 characters"})
 }
 if(password !==password2) {
  errors.push({message: "Passwords do not match"});
 }
 if (errors.length > 0){
  res.render("signup", {errors, email, password, password2});
 } else {
  const hashedPassword = await bcrypt.hash(password, 10);
console.log(hashedPassword);

  // check if the email already exists
  let existingUser = await authModel.findEmail(email)
  console.log('reee')
  if(existingUser.rows > 1) {
    console.log('email exists');
    return res.render("signup", {message: "Email already registered"});
  }

  let createdUser = await authModel.createUser(email, hashedPassword)
  
  console.log('hhhhh');
  if(createdUser.rows){
    req.flash("success_msg", "You have registered successfully. Kindly log in");
    res.redirect("/login");
  }

     }
  } catch(err) {
    console.log(err);
    return res.render("signup", {message: "Email already registered"});

    // res.status(400).send();
  }

 
};
 
exports.dashboard = (req, res) => {
  res.render("dashboard")
};
exports.login = async (req, res) => {
  res.render("login");

}

exports.loginPass = (passport.authenticate('local', {
  successRedirect: '/dashboard',
  failureRedirect: '/login',
  failureFlash: true,
}))


  //  res = await pool.query(
  //   `SELECT * FROM users WHERE email =$1`,
  //   [email],
  //   (err, results) => {
  //     if (err) {
  //       console.log(err);
  //     }
  //     console.log('here');

  //     if (results.row.length > 0) {
  //       return res.render("signup", {message: "Email already registered"});
  //     } else {

  //       console.log('kkk')
  //     const resultNew = await pool.query(
  //         `INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, password`
  //         [email, hashedPassword],
  //         (err, results) => {
  //           if (err) {
  //             throw err;
  //           }
  //           console.log(results.rows);
  //           req.flash("success_msg", "You have registered successfully. Kindly log in");
  //           res.redirect("login");
  //         }
  //       );

  //      }
  //     }
  //   );