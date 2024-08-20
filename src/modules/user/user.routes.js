const router = require("express").Router();
const _userServices = require("./user.service");
const authorization = require("../../middleware/auth.controller");

const prefix = `/v1/scripture/user`;

// Route to add new user
router.post(`${prefix}/new`, _userServices.doAddUser);

// Route to login a new user
router.post(`${prefix}/login`, _userServices.doUserLogin);

// Route to update a user
router.patch(
  `${prefix}/update/:_id`,
  authorization.doAuth,
  _userServices.doUpdateUserByID
);

// Route to delete a user
router.delete(
  `${prefix}/delete/:_id`,
  authorization.doAuth,
  _userServices.doDeleteUserByID
);

// *** test Feature ***
// Route to get all bookmarks
router.get(
  `${prefix}/Bookmark/get`,
  authorization.doAuth,
  _userServices.doGetAllBookmarks
);
// Route to add a book mark
router.post(
  `${prefix}/Bookmark/add`,
  authorization.doAuth,
  _userServices.doAddBookMark
);
// Route to delete a book mark
router.delete(
  `${prefix}/Bookmark/delete/:_id`,
  authorization.doAuth,
  _userServices.doDeleteBookmark
);

// Route to logout User
router.post(
  `${prefix}/logout`,
  authorization.doAuth,
  _userServices.doUserLogout
);

module.exports = router;
