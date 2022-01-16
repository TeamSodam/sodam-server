const functions = require('firebase-functions');
const jwt = require('jsonwebtoken');
const {TOKEN_INVALID, TOKEN_EXPIRED} = require('../constants/jwt');
const secretKey = process.env.JWT_SECRET;
const options = {
    algorithm: 'HS256',
    expiresIn:'30d',
    issuer: 'wesopt',
};

const sign = (user) => {
    const payload = {
        id : user.id,
        email : user.email,
        name : user.name || null,
        idFirebase : user.idFirebase,
    };

    const result = {
        accesstoken : jwt.sign(payload, secretKey, options),
    };

    return result;
};

const verify = (token) => {
    let decoded;
    try{
        decoded = jwt.verify(token, secretKey);
    } catch (err) {
        if(err.message === 'jwt expired'){
            console.log('expired token');
            functions.logger.error('expired token');
            return TOKEN_EXPIRED;
        } else if (err.message === 'invalid token'){
            console.log('invalid token');
            functions.logger.error('invalid token');
            return TOKEN_INVALID;
        } else {
            console.log('invalid token');
            functions.logger.error('invalid token');
            return TOKEN_INVALID;
        }
    }
    return decoded;
};

module.exports = {
    sign,
    verify,
}