const bcrypt = require('bcrypt');

// Compare password using bcrypt (promise-based)
const comparePassword = async (plainPassword, hashedPassword) => {
  try {
    return await bcrypt.compare(plainPassword, hashedPassword);
  } catch (err) {
    console.error('Error comparing password:', err);
    throw err;
  }
};

module.exports = { comparePassword };