const { v4: uuidv4 } = require('uuid');


exports.generateOTP = () => {
// numeric 6-digit OTP
return Math.floor(100000 + Math.random() * 900000).toString();
};


exports.generateTempToken = () => uuidv4();