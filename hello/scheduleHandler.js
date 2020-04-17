'use strict';

module.exports.hello = async event => {
  console.log("TRIGGERED");
  return "SCHEDULED";
};
