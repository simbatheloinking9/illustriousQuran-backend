const _generateResponse = require("./response.controller");
module.exports = async (err, req, res, next) => {
  try {
    console.log("congrats you hit the error middleware");
    if (err.code && err.code == 11000)
      return (err = handleDuplicateKeyError(err, res));

    const response = await _generateResponse("", "", 500, err.message);
    return res.status(response.status).send(response);
  } catch (err) {
    const response = await _generateResponse("", "", 500, err.message);
    return res.status(response.status).send(response);
  }
};

//handle email or username duplicates
const handleDuplicateKeyError = async (err, res) => {
  const field = Object.keys(err.keyValue);
  const code = 409;
  // res.status(code).send(`An account with that ${field} already exists.`);
  const response = await _generateResponse(
    "",
    "",
    403,
    `An account with that ${field} already exists.`
  );
  return res.status(response.status).send(response);
};
