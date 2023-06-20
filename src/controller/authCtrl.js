
const bcrypt = require('bcrypt');
const { initialize, authenticate } = require("passport");
const passport = require('passport');
const pool = require("./../db");
const authModel = require("../model/authModel");
const validator = require('validator');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const { v4: uuidv4 } = require('uuid');



exports.signup = (req, res) => {
  res.render("signup");
}



exports.signupPass = async (req, res) => {
  try{
    let { email, password, password2 } = req.body;
   

    // Function to generate access key, generation date, and expiry date
const generateAccessKey = () => {
  const access_keys = uuidv4(); // Generate a unique key
     // Create generation and expiry dates
     const generationDate = new Date();
     const expiryDate = new Date();
     expiryDate.setFullYear(generationDate.getFullYear() + 1);

    const status = expiryDate > new Date() ? 'Active' : 'Expired';

     return { access_keys, generationDate, expiryDate, status };
}; 
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
  const { access_keys, generationDate, expiryDate, status } = generateAccessKey();
  let createdUser = await authModel.createUser(email, hashedPassword, access_keys, generationDate, expiryDate, status)
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

exports.login = async (req, res) => {
  res.render("login");

}
exports.loginPass = (req, res, next) => {
  const authenticatedUser = passport.authenticate('local', (err, user, info) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Internal server error' });
    }

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.is_verified) {
      return res.status(401).json({ message: 'Email not verified' });
    }

    req.session.user = {
      email: user.email,
    };

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

exports.dashboard = async (req, res) => {
  
  if (req.session.user && req.session.user.email) {
    const currentUserEmail = req.session.user.email;

  try {
    const query = 'SELECT * FROM users';
    const result = await pool.query(query);
    const users = result.rows;

    
    res.render('dashboard', { users, currentUserEmail });
  
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).send('Internal Server Error');
  }
  } else {
    res.redirect('/login');
  }
};

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
  const { token, password, confirmPassword } = req.body;
console.log(token);
  try {
    // Check if the token exists in the tokenMap
    if (!tokenMap.has(token)) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    const email = tokenMap.get(token);

    // Check if the passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update the user's password in the database
    const updateQuery = 'UPDATE users SET password = $1 WHERE email = $2';
    const updateValues = [hashedPassword, email];

    await pool.query(updateQuery, updateValues);

    // Remove the token from the tokenMap
    tokenMap.delete(token);

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
   
};




exports.admin = async (req, res) => {
  if (req.session.user && req.session.user.email) {
    const currentUserEmail = req.session.user.email;

  try {
    const query = 'SELECT * FROM users';
    const result = await pool.query(query);
    const users = result.rows;

    
    res.render('adminsPage', { users, currentUserEmail });
  
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).send('Internal Server Error');
  }
  } else {
    res.redirect('/login');
  }
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
    const query = 'SELECT * FROM users';
    const result = await pool.query(query);
    const accessKeys = result.rows;

    res.render('accessKeys', { accessKeys });
  } catch (error) {
    console.error('Error fetching access_keys:', error);
    res.status(500).send('Internal Server Error');
  }
};

exports.getKeyRevoke = async (req, res) => {
  
  if (req.session.user && req.session.user.email) {
    const currentUserEmail = req.session.user.email;

  try {
    const query = 'SELECT * FROM users';
    const result = await pool.query(query);
    const users = result.rows;

    
    res.render('status', { users, currentUserEmail });
  
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).send('Internal Server Error');
  }
  } else {
    res.redirect('/adminsPage');
  }

};
exports.keyRevoke = async (req, res) => {
  const userId = req.params.id;
  
  try {
    // Check if the user with the given ID exists
    const checkQuery = 'SELECT * FROM users WHERE id = $1';
    const checkResult = await pool.query(checkQuery, [userId]);

    if (checkResult.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Get the current status of the user
    const user = checkResult.rows[0];
    const currentStatus = user.status;

    // Determine the new status based on the current status
    const newStatus = (currentStatus === 'Active') ? 'Revoked' : 'Active';

    // Update the status in the database
    const updateQuery = 'UPDATE users SET status = $1 WHERE id = $2';
    await pool.query(updateQuery, [newStatus, userId]);

    res.status(200).json({ message: 'Status changed successfully', newStatus });
  } catch (error) {
    console.error('Error occurred:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}; 


