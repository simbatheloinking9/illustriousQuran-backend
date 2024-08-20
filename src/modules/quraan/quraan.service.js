const Quraan = require("./quraan.model");
const _generateResponse = require("../../middleware/response.controller");
const _validate = require("../../helpers/helper");
const csvtojson = require("csvtojson");

// ---------------------------------------- TEST ROUTE ---------------------------------------------
// -------------------------------------------------------------------------------------------------
// exports.test = async (req, res, next) => {
//   try {
//     // res.write("Uploading File!");
//     const parsedData = await csvtojson().fromString(req.file.buffer.toString());
//     let bulkUpdateOperations = [];
//     let { language, author } = req.query;
//     const quranData = await Quraan.aggregate([
//       {
//         $project: {
//           chapter: "$chapter",
//           verse: "$verse",
//           translations: "$translations",
//         },
//       },
//     ]);

//     quranData.forEach((currentElement, currentElementIndex) => {
//       bulkUpdateOperations.push({
//         updateOne: {
//           filter: {
//             chapter: currentElement.chapter,
//             verse: currentElement.verse,
//           },
//           update: {
//             $push: {
//               translations: {
//                 language: language,
//                 author: author || "web",
//                 translation: parsedData[currentElementIndex].translation,
//               },
//             },
//           },
//         },
//       });
//     });

//     const data = await Quraan.bulkWrite(bulkUpdateOperations);
//     console.log(data);
//     res.send(data);
//   } catch (err) {
//     next(err);
//   }
// };
// -------------------------------------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------------------------------

// ADD NEW DATA
/**
 * FUNCTION :  doAddTranslationFromFile
 * Adds a new translation to the translations object array from a csv file
 * Requrires ADMIN level Access
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */

exports.doAddTranslationFromFile = async (req, res, next) => {
  try {
    const requiredFields = ["language"]; // requrired query
    const checkQueries = await _validate.checkRequestQueries(
      requiredFields,
      req.query
    );

    if (!checkQueries) {
      const response = await _generateResponse(
        "",
        "",
        400,
        "Missing Queries. Please Check Documentation for Assistance!"
      );
      return res.status(response.status).send(response);
    }
    let { language, author } = req.query;
    if (language === "") {
      const response = await _generateResponse(
        "",
        "",
        400,
        "Language Code is Required"
      );
      return res.status(response.status).send(response);
    }
    if (!author) author = "web";
    const parsedData = await csvtojson().fromString(req.file.buffer.toString());
    const updateModel = new Promise((resolve, reject) => {
      parsedData.forEach(async (element, index, array) => {
        const data = await Quraan.updateOne(
          {
            chapter: element.chapter,
            verse: element.verse,
            "translations.translation": { $ne: element.translation },
          },
          {
            $push: {
              translations: {
                language: language,
                author: author,
                translation: element.translation,
              },
            },
          }
        );
        if (index === array.length - 1) resolve();
      });
    });

    updateModel.then(async () => {
      const response = await _generateResponse(
        "",
        req.token,
        200,
        "Data Added Successfully"
      );
      return res.status(response.status).send(response);
    });
  } catch (err) {
    next(err);
  }
};

// ADDS NEW DATA
/**
 * FUNCTION : doSave
 * Creates a new Quran Verse Object
 * Requries ADMIN level access
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
exports.doSave = async (req, res, next) => {
  try {
    const requiredRole = "admin"; //added role based auth
    if (!(req.role === requiredRole)) {
      const response = await _generateResponse(
        "",
        "",
        401,
        "Permission Denied!"
      );
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

    const result = await Quraan.create(req.body);

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
      "Added Successfully!"
    );

    return res.status(response.status).send(response);
  } catch (err) {
    console.log(err);
    next(err);
  }
};

// FETCHES DATA
/**
 * FUNCTION : doGetByAgg
 * Fetches data from the DB using advance aggregations
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
exports.doGetByAgg = async (req, res, next) => {
  try {
    const requiredQueries = ["language", "chapter", "author", "text"];
    const defaultQueriesValue = {
      language: "en",
      chapter: 1,
      author: "web",
      text: "simple",
    };

    const checkQueries = await _validate.checkRequestQueries(
      requiredQueries,
      req.query
    );

    if (!checkQueries) {
      const response = await _generateResponse(
        "",
        "",
        400,
        "Missing Queries. Please Check Documentation for Assistance!"
      );

      return res.status(response.status).send(response);
    }

    const reqDetails = {
      language: req.query.language || defaultQueriesValue.language,
      chapter: Number(req.query.chapter || defaultQueriesValue.chapter),
      author: req.query.author || defaultQueriesValue.author,
      text: req.query.text || defaultQueriesValue.text,
    };

    const data = await Quraan.aggregate([
      {
        $match: {
          chapter: reqDetails.chapter,
        },
      },
      {
        $project: {
          chapter: "$chapter",
          verse: "$verse",
          text: "$text." + reqDetails.text,
          translations: "$translations",
        },
      },
      {
        $unwind: {
          path: "$translations",
        },
      },
      {
        $match: {
          "translations.author": reqDetails.author,
          "translations.language": reqDetails.language,
        },
      },
      {
        $project: {
          chapter: "$chapter",
          verse: "$verse",
          data: {
            text: "$text",
            translation: "$translations.translation",
          },
        },
      },
    ]);

    if (!data.length) {
      const response = await _generateResponse(
        "",
        "",
        404,
        "Requested Data Not Found"
      );
      return res.status(response.status).send(response);
    }

    const response = await _generateResponse(
      data,
      "",
      200,
      "Data Provided Successfully"
    );

    return res.status(response.status).send(response);
  } catch (err) {
    next(err);
  }
};

// FETCHES DATA
/**
 * FUNCTION : doFindByChapter
 * Gets data using the chapter number
 * unoptimised route gets all the data related to the chapter
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
exports.doFindByChapter = async (req, res, next) => {
  try {
    const { chapter } = req.params;
    if (!chapter) {
      const response = await _generateResponse(
        "",
        "",
        400,
        "Requried Parameters Not Provided!"
      );
      return res.status(response.status).send(response);
    }
    const data = await Quraan.find({
      chapter,
    });

    if (!data.length) {
      const response = await _generateResponse(
        "",
        "",
        404,
        "Resource Doesnot Exists!"
      );
      return res.status(response.status).send(response);
    }

    const response = await _generateResponse(
      data,
      req.token,
      200,
      "Data Provided Successfully!"
    );
    return res.status(response.status).send(response);
  } catch (err) {
    console.log(err);
    next(err);
  }
};

// FETCHES DATA
/**
 * FUNCTION : doFindByChapterVerse
 * Gets data for a verse of a chapter
 * unoptimised route gets all the data related to the verse
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
exports.doFindByChapterVerse = async (req, res, next) => {
  try {
    const { chapter, verse } = req.params;
    if (!chapter || !verse) {
      const response = await _generateResponse(
        "",
        "",
        400,
        "Requried Parameters Not Provided!"
      );
      return res.status(response.status).send(response);
    }
    const data = await Quraan.find({
      chapter: req.params.chapter,
      verse: req.params.verse,
    });

    if (!data.length) {
      const response = await _generateResponse(
        "",
        "",
        404,
        "Resource Doesnot Exists!"
      );
      return res.status(response.status).send(response);
    }

    const response = await _generateResponse(
      data,
      req.token,
      200,
      "Data Provided Successfully!"
    );
    return res.status(response.status).send(response);
  } catch (err) {
    next(err);
  }
};

// FETCHES DATA
// INFO
/**
 * FUNCTION : doGetAvailableLanguages
 * Gets the total unique languages the translation is available in
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
exports.doGetAvailableLanguages = async (req, res, next) => {
  try {
    const data = await Quraan.aggregate([
      {
        $project: {
          translations: "$translations",
        },
      },
      {
        $unwind: {
          path: "$translations",
        },
      },
      {
        $group: {
          _id: "$translations.language",
        },
      },
    ]);

    if (!data.length) {
      const response = await _generateResponse(
        "",
        "",
        500,
        "Something Went Wrong"
      );
      return res.status(response.status).send(response);
    }

    const response = await _generateResponse(
      data,
      req.token,
      200,
      "Data Provided Successfully"
    );
    return res.status(response.status).send(response);
  } catch (err) {
    next(err);
  }
};

// FETCHES DATA
// INFO
/**
 * FUNCTION : doGetAvailableArabicTextVariations
 * Gets all the available arablic text variations
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
exports.doGetAvailableArabicTextVariations = async (req, res, next) => {
  try {
    const data = await Quraan.aggregate([
      {
        $project: {
          text: "$text",
        },
      },
      {
        $project: {
          arrayofkeyvalue: {
            $objectToArray: "$text",
          },
        },
      },
      {
        $unwind: {
          path: "$arrayofkeyvalue",
        },
      },
      {
        $group: {
          _id: "$arrayofkeyvalue.k",
        },
      },
    ]);

    if (!data.length) {
      const response = await _generateResponse(
        "",
        "",
        500,
        "Something Went Wrong"
      );
      return res.status(response.status).send(response);
    }

    const response = await _generateResponse(
      data,
      req.token,
      200,
      "Data Provided Successfully"
    );
    return res.status(response.status).send(response);
  } catch (err) {
    next(err);
  }
};

// FETCHES DATA
// INFO
/**
 * FUNCTION : doGetAvailabeAuthorsBasedOnLanguage
 * Gets all the unique authors who have written a translation in a given language
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
exports.doGetAvailabeAuthorsBasedOnLanguage = async (req, res, next) => {
  try {
    const requiredQuery = ["language"];
    const { language } = req.query;
    const checkQueries = await _validate.checkRequestQueries(
      requiredQuery,
      req.query
    );
    if (!checkQueries) {
      const response = await _generateResponse(
        "",
        "",
        400,
        "Missing Quries. Please Check Documentation For Assistance"
      );
      return res.status(response.status).send(response);
    }

    const data = await Quraan.aggregate([
      {
        $project: {
          translations: "$translations",
        },
      },
      {
        $unwind: {
          path: "$translations",
        },
      },
      {
        $match: {
          "translations.language": language,
        },
      },
      {
        $group: {
          _id: "$translations.author",
        },
      },
    ]);

    if (!data.length) {
      const response = await _generateResponse("", "", 404, "Data Not Found");
      return res.status(response.status).send(response);
    }

    const response = await _generateResponse(
      data,
      req.token,
      200,
      "Data Provided Successfully"
    );
    return res.status(response.status).send(response);
  } catch (err) {
    next(err);
  }
};

// UPDATING RESOURCE
// -----------------------------------------------------------------
exports.doUpdate = async (req, res, next) => {
  // Updates
  try {
    const requiredRole = "admin"; //added role based auth
    if (!(req.role === requiredRole)) {
      const response = await _generateResponse(
        "",
        "",
        401,
        "Permission Denied!"
      );
      return res.status(response.status).send(response);
    }

    const { _id } = req.params;
    if (!_id) {
      const response = await _generateResponse("", "", 400, "ID Not Provided!");
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
    const allowedUpdates = ["chapter", "verse", "translations"]; //allowed fields that can be updated
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
    const result = await Quraan.findByIdAndUpdate(_id, req.body, {
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

// DELETING RESOURCE
// ------------------------------------------------------------------------------
exports.doDelete = async (req, res, next) => {
  try {
    const requiredRole = "admin"; //added role based auth
    if (!(req.role === requiredRole)) {
      const response = await _generateResponse(
        "",
        "",
        401,
        "Permission Denied!"
      );
      return res.status(response.status).send(response);
    }
    const { _id } = req.params;
    if (!_id) {
      const response = await _generateResponse("", "", 400, "ID Not Provided!");
      return res.status(response.status).send(response);
    }
    const result = await Quraan.findByIdAndDelete(_id);
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
    console.log(err);
    next(err);
  }
};
