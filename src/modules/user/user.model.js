const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// USER Schema/Model
// User
// @username : string
// @email : string
// @password  : string
// @tokens  : jsonWebToken
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate(val) {
      if (!validator.isEmail(val))
        throw new Error({ message: `Not a valid Email` });
    },
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  roles: {
    type: String,
    default: "user",
  },

  // *** test Feature ***
  bookmarks: [
    {
      chapterName: { type: String, required: true },
      chapterNumber: { type: Number, required: true },
      verseNumber: { type: Number, required: true },
      note: { type: String, maxlength: 35 },
    },
  ],
  // ***

  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
});

// Functions on the User instances
/*  Function : generateToken
    Generates a jwt token. Adds the same to the User instance calling it and returns the same 

    Parameters:
      this
    
    Returns:
      json web token playload containing the _id of the User Instance
      Adds the token to the User
    
*/
userSchema.methods.generateToken = async function () {
  try {
    const token = jwt.sign(
      { _id: this._id.toString(), role: this.roles },
      "IUSTproject"
    );
    this.tokens = this.tokens.concat({ token });
    await this.save();

    return token;
  } catch (err) {
    console.log({ error: err });
  }
};

/*  Function  :
    Hides the sensitive information about the User Object before returing

    Parameters:
      -
    
    Returns:
      User Object with hidden infromation
*/
userSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  // delete userObject.tokens;

  return userObject;
};

// Functions on the User Model
/*  Function  : findUserByCredentials
    Finds the user with the given email and password and the returns the User Object

    Parameters:
      email - string
      password  - string

    Returns:
      Object  - user: foundUser data, err: undefined
      Object  - user: undefined,  err: error message
 */
userSchema.statics.findUserByCredentials = async function (email, pass) {
  try {
    const user = await User.findOne({ email });
    if (!user) throw new Error(`Incorrect Username / Email`);

    const isAuthenticated = await bcrypt.compare(pass, user.password);
    if (!isAuthenticated) throw new Error(`Incorrect Username / Email`);

    const verifiedUser = { user: user, err: undefined };
    return verifiedUser;
  } catch (err) {
    const failedAuthUser = { user: undefined, err: err.message };
    return failedAuthUser;
  }
};

/*  Method: pre
    Hashes the password string, before saving, to securly store password on DB

    Parameters:
      next, this
    
    Returns:
 */
userSchema.pre("save", async function (next) {
  if (this.isModified("password"))
    this.password = await bcrypt.hash(this.password, 8);

  next();
});

const User = mongoose.model("User", userSchema);
module.exports = User;