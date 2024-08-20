const _auth = require("../../middleware/auth.controller");
const _chapterServices = require("./chapter.service");
const router = require("express").Router();

let prefix = "/v1/scripture/chapterMetaData";

router.get(
  `${prefix}/chapter/:chapterNumber`,
  _chapterServices.doGetMetaDataByChapter
);
router.get(`${prefix}/all`, _chapterServices.doGetMetaData);

module.exports = router;