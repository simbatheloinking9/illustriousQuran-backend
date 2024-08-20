const User = require("./user.model");
const _validate = require("../../helpers/helper");
const _generateResponse = require("../../middleware/response.controller");

// CREATING NEW USER
// -----------------------------------------------------------------------------
exports.doAddUser = async (req, res, next) => {
  try {
    const check = await _validate.checkBody(req.body);
    if (!check) {
      const response = await _generateResponse(
        "",
        "",
        400,
        "Body Not Provided!"
      );
      return res.status(response.status).send(response);
    }

    const user = new User(req.body);
    const result = await user.save();

    if (!result) {
      const response = await _generateResponse(
        "",
        "",
        500,
        "Something Went Wrong!"
      );
      return res.status(response).send(response);
    }

    // const token = await user.generateToken();
    const response = await _generateResponse(
      result,
      req.token,
      200,
      "User Successfully Added!"
    );
    return res.status(response.status).send(response);
  } catch (err) {
    next(err);
  }
};

// EXISTING USER LOGIN
// -------------------------------------------------------------------------------
exports.doUserLogin = async (req, res, next) => {
  try {
    const check = await _validate.checkBody(req.body);
    if (!check) {
      const response = await _generateResponse(
        "",
        "",
        400,
        "Body Not Provided!"
      );
      return res.status(response.status).send(response);
    }

    // FInds user by email and password
    const { user, err } = await User.findUserByCredentials(
      req.body.email,
      req.body.password
    );

    if (err) {
      const response = await _generateResponse(
        "",
        "",
        404,
        "User With the Given Credentials Not Found!"
      );
      return res.status(response.status).send(response);
    }
    // generated a token if user is found
    const token = await user.generateToken();

    // send the user data along with the token
    const response = await _generateResponse(
      user,
      token,
      200,
      "User Successfully Logged-in!"
    );
    return res.status(response.status).send(response);
  } catch (err) {
    next(err);
  }
};

// EXISTING USER LOGOUT
// ---------------------------------------------------------------------------------
exports.doUserLogout = async (req, res, next) => {
  try {
    // removes the token from the User token Array
    req.data.tokens = req.data.tokens.filter(
      (token) => token.token != req.token
    );

    const result = await req.data.save(); // Saves the User after removing the token

    if (!result) {
      const response = await _generateResponse(
        "",
        "",
        500,
        "Something Went Wrong!"
      );
      return res.status(response.status).send(response);
    }

    const response = await _generateResponse(
      "",
      "",
      200,
      "User Successfully Logged-out!"
    );
    return res.status(response.status).send(response);
  } catch (err) {
    next(err);
  }
};

// USER UPDATE
// --------------------------------------------------------------------
exports.doUpdateUserByID = async (req, res, next) => {
  try {
    const { _id } = req.params;
    if (!_id) {
      const response = await _generateResponse("", "", 400, "ID Not Provided");
      return res.status(response.status).send(response);
    }
    const check = await _validate.checkBody(req.body);
    if (!check) {
      const response = await _generateResponse(
        "",
        "",
        400,
        "Body Not Provided!"
      );
      return res.status(response.status).send(response);
    }
    // update validation check
    const allowedUpdates = ["username", "password"]; //allowed fields that can be updated
    const validUpdate = await _validate.checkValidateUpdate(
      allowedUpdates,
      req.body
    );
    if (!validUpdate) {
      const response = await _generateResponse(
        "",
        "",
        403,
        "Update Not Allowed!"
      );
      return res.status(response.status).send(response);
    }

    // Sends an update request
    const result = await User.findByIdAndUpdate(_id, req.body, {
      new: true,
      runValidators: true,
    });

    // if not found
    if (!result) {
      const response = await _generateResponse(
        "",
        "",
        500,
        "Something went Wrong!"
      );
      return res.status(response.status).send(response);
    }

    const response = await _generateResponse(
      result,
      req.token,
      200,
      "Updated Successfully!"
    );

    return res.status(response.status).send(response);
  } catch (err) {
    next(err);
  }
};

// USER DELETE
// --------------------------------------------------------------------------
exports.doDeleteUserByID = async (req, res, next) => {
  try {
    const { _id } = req.params;
    if (!_id) {
      const response = await _generateResponse("", "", 400, "ID Not Provided!");
      return res.status(response.status).send(response);
    }
    const result = await User.findByIdAndDelete(_id);
    // if not found with given id
    if (!result) {
      const response = await _generateResponse(
        "",
        "",
        404,
        "Resource You Are Trying to Delete Does not Exists"
      );
      return res.status(response.status).send(response);
    }

    const response = await _generateResponse(
      result,
      req.token,
      202,
      "Deleted Successfully!"
    );

    return res.status(response.status).send(response);
  } catch (err) {
    next(err);
  }
};

// *** test Feature ***

exports.doGetAllBookmarks = async (req, res, next) => {
  try {
    const user = req.data;
    const response = await _generateResponse(
      user.bookmarks,
      req.token,
      200,
      "Data Provided Successfully"
    );
    return res.status(response.status).send(response);
  } catch (err) {
    next(err);
  }
};

exports.doAddBookMark = async (req, res, next) => {
  try {
    const user = req.data;
    const note = req.body.note || "";
    const requiredQueries = ["chapterNumber", "verseNumber", "chapterName"];
    const checkQueries = await _validate.checkRequestQueries(
      requiredQueries,
      req.query
    );
    if (!checkQueries) {
      const response = await _generateResponse(
        "",
        "",
        400,
        "Missing Quries. Please Check The Doucmentation"
      );
      return res.status(response.status).send(response);
    }
    const { chapterName, chapterNumber, verseNumber } = req.query;
    const bookmark = {
      chapterName,
      chapterNumber,
      verseNumber,
      note,
    };

    user.bookmarks = user.bookmarks.concat(bookmark);
    const data = await user.save();
    if (!data) {
      const response = await _generateResponse(
        "",
        "",
        500,
        "Something Went Wrong"
      );
      return res.status(response.status).send(response);
    }

    const response = await _generateResponse(
      data.bookmarks,
      req.token,
      200,
      "Data Added Successfully"
    );
    return res.status(response.status).send(response);
  } catch (err) {
    next(err);
  }
};

exports.doDeleteBookmark = async (req, res, next) => {
  try {
    const user = req.data;
    const { _id } = req.params;
    if (!_id) {
      const response = await _generateResponse("", "", 400, "ID Not Provied");
      return res.status(response.status).send(response);
    }

    user.bookmarks = user.bookmarks.filter((bookmark) => bookmark._id != _id);

    const data = await user.save();
    if (!data) {
      const response = await _generateResponse(
        "",
        "",
        500,
        "Something Went Wrong"
      );
      return res.status(response.status).send(response);
    }

    const response = await _generateResponse(
      data.bookmarks,
      req.token,
      200,
      "Data Deleted Successfully"
    );
    return res.status(response.status).send(response);
  } catch (err) {
    next(err);
  }
};
