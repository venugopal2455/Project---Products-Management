const mongoose = require('mongoose')

const isValid = function(value) {
  if(typeof value === 'undefined' || value === null) return false
  if(typeof value === 'string' && value.trim().length === 0) return false
  if(typeof value === "object") return false
  return true
}

const isValidBody = (object) => {
    if (Object.keys(object).length > 0) {
      return false
    }else {
      return true;
    }
  };
  
  const validString = (String) => {
    if (/\d/.test(String)) { 
      return true
    }else {
      return false;
    };
  };
  
  const validMobileNum = (Mobile) => {
    if (/^[6-9]\d{9}$/.test(Mobile)) {
      return false
    }else {
      return true;
    };
  };
  
  const validEmail = (Email) => {
    if (/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(Email)){
      return false
    }else {
      return true;
    }
      
  };
  
  const validPwd = (Password) => {
    if (/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,15}$/.test(Password)){
      return false
    }else {
      return true;
    }
  };

  const isValidObjectId = (objectId) => {
    return mongoose.Types.ObjectId.isValid(objectId)
  }

  const validPrice = (Number) => {
    if (/^[1-9]\d*(\.\d+)?$/.test(Number)) {
      return false
    }else {
      return true;
    };
  };

  const isValidImage = (image) => {
    if ((/.*\.(jpeg|jpg|png)$/).test(image.originalname)) return true;
    return false
}

  const validSize = (sizes) => {
    return (["S", "XS","M","X", "L","XXL", "XL"].includes(sizes));
  }

  const isValidStatus = function(status) {
    return ['pending', 'completed', 'cancelled'].indexOf(status) !== -1
}

const isValidPincode = (num) => {
  return /^[0-9]{6}$/.test(num);
}
  
  module.exports = { isValid, isValidBody, validString, validMobileNum, validEmail, validPwd,isValidObjectId,validPrice, validSize, isValidStatus, isValidImage, isValidPincode};