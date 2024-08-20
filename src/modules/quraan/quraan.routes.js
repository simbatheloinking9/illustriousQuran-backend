const router = require("express").Router();
const _quraanService = require("./quraan.service");
const _authorization = require("../../middleware/auth.controller");
const multer = require("multer");

let prefix = "/v1/scripture/quraan";

// Multer File Upload Config
const upload = multer({
  fileFilter(req, file, cb) {
    if (!file.originalname.endsWith("csv"))
      return cb(new Error("Only CSV Files are Allowed"));
    return cb(undefined, true);
  },
});

// ------------------------------------- TEST ROUTE -------------------------------------
// -------------------------------------------------------------------------------------
// router.post(
//   `${prefix}/test`,
//   upload.single("translation"),
//   _quraanService.test
// );
// ------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------

// ---------------------------------------------- GET ROUTES  ------------------------------------------------- //
// ROUTE TO GET RESOURCE USING AGGREGATION
// OPTIMISED ROUTE
router.get(`${prefix}/get`, _quraanService.doGetByAgg);

// ROUTE TO GET RESOURCE BY CHAPTER NUMBER
// UNOPTIMISED ROUTE
router.get(`${prefix}/search/:chapter`, _quraanService.doFindByChapter);

// ROUTE TO GET RESOURXE BY CHAPTER NUMBER AND VERES NUMBER
router.get(
  `${prefix}/search/:chapter/:verse`,
  _quraanService.doFindByChapterVerse
);

// ROUTE TO GET ALL THE AVAILABE LANGUAGE TRANSLATIONS
router.get(`${prefix}/info/languages`, _quraanService.doGetAvailableLanguages);

// ROUTE TO GET THE AVAILABLE TEXT VARIATIONS
router.get(
  `${prefix}/info/arabicText`,
  _quraanService.doGetAvailableArabicTextVariations
);

// ROUTE TO GET THE AVAILABLE AUTHORS BASED ON LANGUAGE
router.get(
  `${prefix}/info/authorsForLanguage`,
  _quraanService.doGetAvailabeAuthorsBasedOnLanguage
);



// ---------------------------------------------- POST ROUTES  ------------------------------------------------- //
// ROUTE TO UPLOAD A NEW TRANSLATION ONLY USING A CSV FILE
router.post(
  `${prefix}/update/addFile/addTranslation`,
  _authorization.doAuth,
  upload.single("translation"),
  _quraanService.doAddTranslationFromFile
);

// ROUTE TO ADD A NEW QURAN VERSE OBJECT
// *** TO BE DELETED  ***
router.post(prefix + "/save", _authorization.doAuth, _quraanService.doSave);

// ---------------------------------------------- PATCH ROUTES  ------------------------------------------------- //
// ROUTE TO UPDATE A QURAN VERES OBJECT USING ID
router.patch(
  prefix + "/update/:_id",
  _authorization.doAuth,
  _quraanService.doUpdate
);

// ---------------------------------------------- DELETE ROUTES  ------------------------------------------------- //
// ROUTE TO DELETE A QURAN VERSE OBJECT USING ID
// *** TO BE DELETED  ***
router.delete(
  `${prefix}/delete/:_id`,
  _authorization.doAuth,
  _quraanService.doDelete
);

module.exports = router;
