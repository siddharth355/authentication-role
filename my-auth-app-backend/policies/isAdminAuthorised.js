const mongoose = require("mongoose");
const Model = require("../models/index");
const universalFunction = require("../lib/universalFunction");
const messageList = require("../messages");
const message = messageList.messages.MESSAGES;

module.exports = async (req, res, next) => {
  try {
    if (req.headers && req.headers.authorization) {
      const accessToken = req.headers.authorization;
      const decodeData = await universalFunction.jwtVerify(accessToken);
      if (!decodeData) {
        return universalFunction.forBiddenResponse(
          req,
          res,
          message.TOKEN_INVALID
        );
      }
      let adminData = await Model.User.findOne({
        _id: decodeData._id,
        role: "ADMIN",
      });
      if (!adminData) {
        return universalFunction.unauthorizedResponse(
          req,
          res,
          message.TOKEN_INVALID
        );
      }
      req.user = adminData;
      next();
    } else {
      return universalFunction.unauthorizedResponse(
        req,
        res,
        message.MISSING_TOKEN
      );
    }
  } catch (error) {
    return universalFunction.unauthorizedResponse(
      req,
      res,
      message.UNAUTHORIZED
    );
  }
};
