const { body, check, validationResult } = require("express-validator");

////////////////////////////////////////////////////////////
// Validate schedule
////////////////////////////////////////////////////////////
const valaddSchedule = () => {
  // Validate each input
  return [
    body("startDate").isDate().not().isEmpty(),
    body("endDate").isDate().not().isEmpty(),
    body("startTime").not().isEmpty(),
    body("endTime").not().isEmpty(),
    body("eventTitle").not().isEmpty().isLength({ min: 3, max: 50 }),
    body("eventDesc").not().isEmpty().isLength({ min: 5, max: 255 }),
  ];
};

const valaddScheduleErr = (req, cb) => {
  const errors = validationResult(req);
  // Checking for errors
  if (!errors.isEmpty()) {
    console.log(errors.array());
    cb(422);
  }
  // No errors --> parse 200
  if (errors.isEmpty()) {
    cb(200);
  }
};

////////////////////////////////////////////////////////////
// Validate register
////////////////////////////////////////////////////////////
const valReg = () => {
  // Validate each input
  return [
    body("fName").notEmpty(),
    body("lName").notEmpty().isLength({ min: 3 }),
    body("email").isEmail(),
    body("password").notEmpty().isLength({ min: 8 }),
  ];
};

const valRegErr = (req, cb) => {
  const errors = validationResult(req);
  console.log("check1", errors);
  // Checking for errors
  if (!errors.isEmpty()) {
    cb(422);
    console.log(errors.array());
  }
  // No errors --> parse 200
  if (errors.isEmpty()) {
    cb(200);
  }
};

// Exports
module.exports = {
  valaddSchedule,
  valaddScheduleErr,
  valReg,
  valRegErr,
};
