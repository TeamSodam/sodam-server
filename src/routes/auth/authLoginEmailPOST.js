const util = require('../../lib/util');
const responseMessage = require('../../constants/responseMessage');
const statusCode = require('../../constants/statusCode');
const { userDB } = require('../../db');
const db = require('../../db/db');

const { firebaseAuth } = require('../../config/firebaseClient');

const jwtHandlers = require('../../lib/jwtHandlers');
const { signInWithEmailAndPassword } = require('firebase/auth');

// var admin = require("firebase-admin"); 

//var serviceAccount = require("../../sodam-server-authentication.json");

//admin.initializeApp({
//    credential: admin.credential.cert(serviceAccount)
//});

module.exports = async (req, res) => {
  //sort쿼리 popular, mysave (지역별에서) , popular, review(테마별에서)
  const { email, password } = req.body;

  let client;

  try {
    client = await db.connect(req);
    
    const userDatabase = await signInWithEmailAndPassword(firebaseAuth, email, password)
      .then((user) => user)
      .catch((e) => {
        console.log(e);
        return { err:true, error:e };
      });
    if(userDatabase.err){
      if(userDatabase.error.code === 'auth/user-not-found'){
        return res.status(statusCode.NOT_FOUND).json(util.fail(statusCode.NOT_FOUND,
          responseMessage.NO_USER));
      } else if(userDatabase.error.code === 'auth/invalid-email'){
        return res.status(statusCode.NOT_FOUND).json(util.fail(statusCode.NOT_FOUND,
          responseMessage.INVALID_EMAIL));
      } else if(userDatabase.error.code === 'auth/wrong-password'){
        return res.status(statusCode.NOT_FOUND).json(util.fail(statusCode.NOT_FOUND,
          responseMessage.MISS_MATCH_PW));
      } else {
        return res.status(statusCode.INTERNAL_SERVER_ERROR).json(util.fail(statusCode.INTERNAL_SERVER_ERROR,
          responseMessage.INTERNAL_SERVER_ERROR));
      }
    }

    const {
      user : {uid : idFirebase},
    } = userDatabase;

    const user = await userDB.getUserByIdFirebase(client, idFirebase);
    const { accesstoken } = jwtHandlers.sign(user);

    res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.LOGIN_SUCCESS, { user,
      accesstoken
    }));
  } catch {    
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally{
    client.release();
  }
};