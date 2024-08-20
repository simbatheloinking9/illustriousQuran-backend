const Chapter = require("./chapter.model");
const _generateResponse = require("../../middleware/response.controller");

exports.doGetMetaData = async (req, res, next) => {
  try {
    const data = await Chapter.find({});
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
exports.doGetMetaDataByChapter = async (req, res, next) => {
  try {
    const { chapterNumber } = req.params;
    if (!chapterNumber) {
      const response = await _generateResponse("", "", 400, "ID Not Provided");
      return res.status(response.status).send(response);
    }

    // console.log(String(chapter));

    const data = await Chapter.aggregate([
      {
        $match: {
          chapter: chapterNumber,
        },
      },
    ]);

    if (!data.length) {
      const response = await _generateResponse(
        "",
        "",
        404,
        "Resource Not Found"
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
    console.log(err);
    next(err);
  }
};

exports.doUpdateMetaDataByID = async (req, res, next) => {};
