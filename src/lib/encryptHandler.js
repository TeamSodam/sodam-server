const crypto =  require('crypto');
const createSalt = () =>
  new Promise((resolve, reject) => {
    crypto.randomBytes(64, (err, buf) => {
      if (err) reject(err);
      resolve(buf.toString('base64'));
    });
  });

module.exports = {
  createHashedPassword: (plainPassword) => {
    return new Promise(async (resolve, reject) => {
      const salt = await createSalt();
      crypto.pbkdf2(plainPassword, salt, 9999, 64, 'sha512', (err, key) => {
        if (err) reject(err);
        resolve({ password: key.toString('base64'), salt });
      });
    });
  },
  checkHashedPassword: (plainPassword, salt, savedPassword) => {
    return new Promise(async (resolve, reject) => {
      crypto.pbkdf2(plainPassword, salt, 9999, 64, 'sha512', (err, key) => {
        if (err) reject(err);

        const loginSuccess = key.toString('base64') === savedPassword ? true : false;
        resolve(loginSuccess);
      });
    })
  }
};
