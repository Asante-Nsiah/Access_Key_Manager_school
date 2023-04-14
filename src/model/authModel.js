// pool.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
//   if (err) {
//     return res.status(500).send(err);
//   }
//   if (!results.length) {
//     return res.status(404).send('User not found');
//   }
//   // Check if the current password is correct
//   bcrypt.compare(currentPassword, results[0].password, (err, result) => {
//     if (err) {
//       return res.status(500).send(err);
//     }
//     if (!result) {
//       return res.status(401).send('Current password is incorrect');
//     }
//     // Hash the new password and update the user's password in the database
//     bcrypt.hash(newPassword, saltRounds, (err, hash) => {
//       if (err) {
//         return res.status(500).send(err);
//       }
//       pool.query('UPDATE users SET password = ? WHERE email = ?', [hash, email], (err) => {
//         if (err) {
//           return res.status(500).send(err);
//         }
//         return res.status(200).send('Password updated successfully');
//       });
//     });
//   });
// });
const pool = require("./../db")

exports.findEmail = async (email) => {
    let sql = `SELECT * FROM users WHERE email =$1`;
    let result = await pool.query(sql , [email] )
    return result
}

exports.createUser = async (email, hashedPassword) => {
    let sql = `INSERT INTO users (email, password) VALUES ($1, $2)`;
    let result = await pool.query(sql , [email, hashedPassword] )
    return result
}

 