const User = require("../modules/user/user.model");
const jwt = require("jsonwebtoken");
const generateResponse = require("./response.controller");

/*  Functions: doAuth
    Checks if the user has permission to access the API Routes

    Parameters:
        req -   request header containing the jwt token
        res -   
        next - call to next middleware

    Returns:
        If the token is associated with the User
        req.token   - Sends the token to the next function
        req.data    - Sends the User Object to the next function
        req.role    - Sends the current Users role
        
        Throws a 401 error if token is not verified!

*/
exports.doAuth = async (req, res, next) => {
  try {
    let token = req.header("Authorization").split("Bearer "); // token is stored on req.header
    const decodedToken = jwt.verify(token[1], process.env.JWT_SECRET); //verifies the token

    // find the user with the information in the token payload
    const user = await User.findOne({
      _id: decodedToken._id,
      "tokens.token": token[1],
      roles: decodedToken.role,
    });

    // if user is not found
    if (!user) {
      const response = await generateResponse(
        "",
        "",
        401,
        "Token Not Verified"
      );

      return res.status(response.status).send(response);
    }

    req.token = token[1]; // Returns the token
    req.data = user; // Returns the User Object
    req.role = decodedToken.role; // Returns the role
    next();
  } catch (err) {
    const response = await generateResponse(
      "",
      "",
      500,
      `Error Authenticating Token ${err.message}`
    );

    return res.status(response.status).send(response);
  }
};
