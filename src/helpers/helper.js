exports.checkBody = async (body) => {
  try {
    if (
      Object.keys(body).length == undefined ||
      Object.keys(body).length == 0
    ) {
      return false;
    }
    return true;
  } catch (err) {
    return err;
  }
};

exports.checkValidateUpdate = async (validUpdate, body) => {
  try {
    const requestedUpdateFields = Object.keys(body);
    const isValidUpdate = requestedUpdateFields.every((field) =>
      validUpdate.includes(field)
    );
    if (!isValidUpdate) return false;
    return true;
  } catch (err) {
    return err;
  }
};

exports.checkRequestQueries = async (requiredQuery, body) => {
  try {
    const requestedQuery = Object.keys(body);
    const queriedMatched = requiredQuery.every((query) =>
      requestedQuery.includes(query)
    );
    if (!queriedMatched) {
      err = "Missing Query, Please Check Documentation for Assistance";
      return false;
    }
    return true;
  } catch (err) {
    return err;
  }
};
