const AWSXRay = require('aws-xray-sdk-core');
const AWS = AWSXRay.captureAWS(require('aws-sdk'));

const s3 = new AWS.S3()

exports.handler = async function(event) { 
    return s3.listBuckets().promise();
}