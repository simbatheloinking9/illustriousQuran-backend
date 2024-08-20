const responses = new Map([
  ["200", "All OK!"],
  ["201", "Created"],
  ["202", "Accepted"],
  ["204", "No Content"],
  ["400", "Bad Request"],
  ["401", "Unauthorized"],
  ["402", "Payment Required"],
  ["403", "Forbidden"],
  ["404", "Not Found"],
  ["405", "Method Not Allowed"],
  ["406", "Not Acceptable"],
  ["500", "Internal Server Error"],
  ["501", "Not Implemented"],
  ["502", "Bad Gateway"],
  ["503", "Service Unavailable"],
  ["504", "Gateway Timeout"],
]);

const generateResponse = async function (data, token, status, message) {
  try {
    let responseGenerated = {
      status,
      type: responses.get(status.toString()),
      message,
      data,
      token,
    };
    return responseGenerated;
  } catch (err) {
    console.log("FUNCK");
    return err;
  }
};

module.exports = generateResponse;
