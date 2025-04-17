const db = require('../config/db');

const getUserByEmail = async (email) => {
  const [user] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
  return user[0];
};

module.exports = { getUserByEmail };
