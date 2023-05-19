
const bcrypt = require('bcrypt');
const { initialize, authenticate } = require("passport");
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const pool = require("./../db");
const authModel = require("../model/authModel")
const validator = require('validator');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const req = require('express/lib/request');
const { render } = require('ejs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const helmet = require('./../app.js');


exports.signup = (req, res) => {
  res.render("signup");
}



exports.signupPass = async (req, res) => {
  try{
    let { email, password, password2 } = req.body;
console.log(req.body)
  if (!validator.isEmail(email)){
    return res.status(400).send('Invalid email address');
  }
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
  if(existingUser.rows > 1) {
    console.log('email exists');
    return res.render("signup", {message: "Email already registered"});
  }

  let createdUser = await authModel.createUser(email, hashedPassword)
  if(createdUser.rows){
    req.flash("success_msg", "You have registered successfully. Kindly log in");
    res.redirect("/login");
  }
  // Generate verification token
  const token = jwt.sign({ email }, 'secret', { expiresIn: '1h' });
  console.log(`This is the token :${token}`);


  // Create email transport and send verification email
  const transporter = nodemailer.createTransport({
    pool: true,
    host: "smtp.gmail.com",
    port: 465,
    auth: {
      user: 'demoproject369@gmail.com',
      pass: 'ikuckqlhraenviig'
    },
    tls: {
    
      rejectUnauthorized: false,
    },
  });

  const mailOptions = {
    from: 'demoproject369@gmail.com',
    to: email,
    subject: 'Verify your email',
    text: `Please click the following link to verify your email: http://localhost:3000/verify?token=${token}`
  };
console.log('find error')
  try {
    await transporter.sendMail(mailOptions);

    const insertQuery = 'INSERT INTO users (email, password, is_verified) VALUES ($1, $2, $3)';
    const insertValues = [email, password, false];
    await pool.query(insertQuery, insertValues);
    res.send('Verification email sent!');
  } catch (error) {
    console.error(error);
    res.status(500).send('Failed to send verification email');
  }
     }
  } catch(err) {
    console.log(err);
    return res.render("signup", {message: "Email already registered"});

  }

};
 
exports.verify = async (req, res) => {
  const token = req.query.token;

  try {
    const decodedToken = jwt.verify(token, 'secret');
    const email = decodedToken.email;

    const query = 'SELECT * FROM users WHERE email = $1';
    const values = [email];

    const { rows } = await pool.query(query, values);

    if (rows.length === 0) {
      return res.status(400).send('User not found');
    }

    const user = rows[0];

    if (user.is_verified) {
      return res.send('Email already verified');
    }

    const updateQuery = 'UPDATE users SET is_verified = $1 WHERE email = $2';
    const updateValues = [true, email];

    await pool.query(updateQuery, updateValues);

    res.send('Email verified!');
  } catch (error) {
    console.error(error);
    res.status(400).send('Invalid or expired verification token');
  }
};
exports.dashboard = (req, res) => {
  res.render("dashboard")
};
exports.login = async (req, res) => {
  res.render("login");

}
exports.loginPass = (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Internal server error' });
    }

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if the email matches the admin email
    if (user.email === 'demoproject369@gmail.com') {
      // Redirect to the admin page
      return res.redirect('/adminsPage');
    }

    // Redirect to the dashboard
    return res.redirect('/dashboard');
  })(req, res, next);
};
// exports.loginPass = (passport.authenticate('local', {
//   successRedirect: '/dashboard',
//   failureRedirect: '/login',
//   failureFlash: true,
// }))

exports.resetPassword = (req, res) => {
  res.render("reset-password");

};

// Set up nodemailer transporter with your email service credentials
const transporter = nodemailer.createTransport({
  pool: true,
    host: "smtp.gmail.com",
    port: 465,
    auth: {
      user: 'demoproject369@gmail.com',
      pass: 'ikuckqlhraenviig'
    },
    tls: {
    
      rejectUnauthorized: false,
    },
});

// Generate a random token for password reset
function generateToken() {
  const length = 20;
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

// Store the token and email in memory for demo purposes
const tokenMap = new Map();
exports.forgetPassword = async (req, res) => {
  const { email } = req.body;
  // Check if email exists in your user database
  // If it does, generate a token and send a password reset email
  // with a link that includes the token in the URL
  try {
    const user = await authModel.findEmail({ email });
    console.log(`email:${email}`)
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const token = generateToken();
    tokenMap.set(token, email);
    const mailOptions = {
      from: 'demoproject369@gmail.com',
      to: email,
      subject: 'Password reset request',
      text: `Click the following link to reset your password: http://localhost:3000/reset-actual-password/${token}`
    };

   
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error sending email' });
      }
      console.log('Email sent: ' + info.response);
      res.status(200).json({ message: 'Password reset email sent' });
      pool.query('UPDATE users SET resetLink = $1 WHERE email = $2', [token, email], (err, result) => {
        if (err) {
          console.log(err);
          return res.status(400).json({ message: 'Reset password link error' });
        }
        console.log('Reset password link updated successfully');
      });
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Internal server error' });
  }
  
    
};

exports.resetActualPassword = (req, res) => {
  const { token } = req.query;
  res.render('reset-actual-password', {token});

 
};
exports.resetActualPasswordPass = async (req, res) => {
  const { token, newpassword, confirmpassword } = req.body;
  try {
   
    console.log(token);
    
    if (!token) {
      return res.status(400).json({ message: 'Reset link is missing or invalid' });
    }

    const resetData = await authModel.findResetData(resetLink);
    console.log(resetData);
    if (!resetData) {
      return res.status(404).json({ message: 'Invalid or expired token' });
    }
    
    const email = resetData.email;
    const user = await authModel.findEmail(email);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // res.render('/reset-actual-password');
    // const { newpassword, confirmpassword } = req.body;
    const errors = [];

    if (!newpassword || !confirmpassword) {
      errors.push({ message: 'Please fill all fields' });
    }

    if (newpassword && newpassword.length < 6) {
      errors.push({ message: 'Password must be at least 6 characters long' });
    }

    if (newpassword !== confirmpassword) {
      errors.push({ message: 'Passwords do not match' });
    }

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const hashedPassword = await bcrypt.hash(newpassword, 10);
    await authModel.updatePassword(email, hashedPassword);
    await authModel.deleteResetData(resetLink);

    req.flash('success_msg', 'Your password has been reset. Please log in.');
    res.redirect('/login');
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};




exports.admin = (req, res) => {
  res.render('adminsPage');
  keys = async (req, res) => {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT key_id, key_value, created_at, expires_at, revoked_at FROM keys');
      res.send(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).send({ message: 'Error getting keys' });
    } finally {
      client.release();
    }
  };
};

exports.users = async (req, res) => {
  try {
    const query = 'SELECT * FROM users';
    const result = await pool.query(query);
    const users = result.rows;

    res.render('users', { users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).send('Internal Server Error');
  }
};
exports.accessKeys = async (req, res) => {
  try {
    const query = 'SELECT * FROM access_keys';
    const result = await pool.query(query);
    const accessKeys = result.rows;

    res.render('accessKeys', { accessKeys });
  } catch (error) {
    console.error('Error fetching access_keys:', error);
    res.status(500).send('Internal Server Error');
  }
};



//   const fetchKeys = async () => {
//     try {
//       const response = await fetch('/keys');
//       const data = await response.json();
//       return data;
//     } catch (error) {
//       console.error(error);
//     }
//   };
  
//   const populateTable = async () => {
//     const keys = await fetchKeys();
  
//     const dom = new JSDOM(`<!DOCTYPE html><html><body><table id="key-list"><tbody></tbody></table></body></html>`);
//     const document = dom.window.document;
  
//     const tableBody = document.querySelector('#key-list tbody');
  
//     if (Array.isArray(keys)) {
//       keys.forEach((key) => {
//         const row = document.createElement('tr');
  
//         const keyCell = document.createElement('td');
//         keyCell.textContent = key.key;
//         row.appendChild(keyCell);
  
//         const userCell = document.createElement('td');
//         userCell.textContent = key.user_email;
//         row.appendChild(userCell);
  
//         const statusCell = document.createElement('td');
//         statusCell.textContent = key.status;
  
//         if (key.status === 'active') {
//           statusCell.classList.add('active');
//         } else if (key.status === 'expired') {
//           statusCell.classList.add('expired');
//         } else if (key.status === 'revoked') {
//           statusCell.classList.add('revoked');
//         }
  
//         row.appendChild(statusCell);
  
//         const procurementCell = document.createElement('td');
//         procurementCell.textContent = key.procurement_date;
//         row.appendChild(procurementCell);
  
//         const expiryCell = document.createElement('td');
//         expiryCell.textContent = key.expiry_date;
//         row.appendChild(expiryCell);
  
//         tableBody.appendChild(row);
//       });
//     } else {
//       console.error('Keys data is not an array');
//     }
  
//     console.log(dom.serialize());
//   };
  
//   populateTable();
// };


