const { body, validationResult } = require("express-validator");

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
    body("eventTitle").not().isEmpty().isLength({ min: 2, max: 50 }),
    body("eventDesc").not().isEmpty().isLength({ min: 2, max: 255 }),
  ];
};

////////////////////////////////////////////////////////////
// Validate register
////////////////////////////////////////////////////////////
const valReg = () => {
  // Validate each input
  return [
    body("fName").notEmpty().isLength({ min: 2, max: 30 }),
    body("lName").notEmpty().isLength({ min: 3, max: 30 }),
    body("email").isEmail(),
    body("password").notEmpty().isLength({ min: 8 }),
  ];
};

////////////////////////////////////////////////////////////
// Validate login
////////////////////////////////////////////////////////////
const valLog = () => {
  return [
    body("email").isEmail(),
    body("password").notEmpty().isLength({ min: 8 }),
  ];
};

////////////////////////////////////////////////////////////
// Validate updating user name
////////////////////////////////////////////////////////////
const valUpdateName = () => {
  return [body("newName").notEmpty().isLength({ min: 2, max: 20 })];
};

////////////////////////////////////////////////////////////
// Validate query param for getSchedule
////////////////////////////////////////////////////////////
// const valQueryParmSchedule = () => {
//   body(req.params.path).notEmpty().isLength({ min: 24, max: 24 });
// };

////////////////////////////////////////////////////////////
// Validate all errors
////////////////////////////////////////////////////////////
const valErrors = (req, cb) => {
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
  // valQueryParmSchedule,
  valUpdateName,
  valLog,
  valaddSchedule,
  valReg,
  valErrors,
};
