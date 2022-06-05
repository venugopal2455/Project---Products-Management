const jwt = require('jsonwebtoken');
const { isValidObjectId} = require('../utils/validation');
const userModel = require('../models/userModel');

const authentication = async (req, res, next) => {
    try{
        let bearerHeader = req.headers.authorization;
        if(typeof bearerHeader == "undefined") return res.status(403).send({ status: false, message: "Token is missing" });
        //console.log(bearerHeader)
         let bearerToken = bearerHeader.split(' ')
        //console.log(bearerToken)
         let token = bearerToken[1];
         //console.log(token)

        let decodedToken = jwt.verify(token, "Uranium Project-5")
        if(!decodedToken) return res.status(400).send({status: false , message: "Invalid token id"})
        req.decodedToken = decodedToken
        console.log(decodedToken)
        next()
    }catch(err){
        if(err.message == "jwt expired") return res.status(400).send({ status: false, message: "JWT token has expired, login again" })
        if(err.message == "invalid signature") return res.status(400).send({ status: false, message: "Token is incorrect" })
        return res.status(500).send({Status: false, Error: err.message})
    }
}

const authorization = async (req, res, next) => {
  try {
    let loggedInUser = req.decodedToken.userId;;
    let userLogging;

    if(req.params?.userId){
      if (!isValidObjectId(req.params.userId)) return res.status(400).send({ status: false, message: "Enter a valid user id" });
      let userData = await userModel.findById(req.params.userId);
      if (!userData) return res.status(404).send({ status: false, message: "Error! Please check user id and try again" });
      userLogging = userData._id.toString();
    }

    if (!userLogging) return res.status(400).send({ status: false, message: "User Id is required" });

    if (loggedInUser !== userLogging) return res.status(403).send({ status: false, message: 'Error, authorization failed' })
    next()
  } catch (err) {
    res.status(500).send({ status: false, error: err.message })
  }
}
module.exports = { authentication, authorization };