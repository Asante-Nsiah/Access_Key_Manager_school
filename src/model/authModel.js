
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
exports.updatePassword = async (email, hashedPassword) => {
    let sql = `UPDATE users SET password = $1 WHERE email = $2`;
    let result = await pool.query(sql , [hashedPassword, email] )
    return result
}
exports.updateUser = async (email, hashedPassword) => {
    let sql = `UPDATE users SET password = $1 WHERE email = $2`;
    let result = await pool.query(sql , [hashedPassword, email] )
    return result
}

// exports.findResetData = async (resetLink) => {
//     let sql = `SELECT * FROM users WHERE resetlink = $1`;
//     let result = await pool.query(sql, [resetLink]);
//     return result.rows[0];
//   };
  
  exports.deleteResetData = async (resetLink) => {
    let sql = `DELETE FROM reset_data WHERE resetlink = $1`;
    await pool.query(sql, [resetLink]);
  };

  exports.findResetData = async (resetLink) => {
    try {
      let sql = `SELECT * FROM users WHERE resetlink = $1`;
      let result = await pool.query(sql, [resetLink]);
      return result.rows[0];
    } catch (error) {
      console.error(error);
      throw new Error('Error finding reset data');
    }
  };