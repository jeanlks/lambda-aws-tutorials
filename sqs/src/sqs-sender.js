const AWS = require("aws-sdk");
const sqs = new AWS.SQS({
    region: "sa-east-1",
});
exports.handler = (event, context, callback) => {
    console.info(event);
    const accountId = context.invokedFunctionArn.split(":")[4];
    const queueUrl = `https://sqs.sa-east-1.amazonaws.com/${accountId}/testing-sqs-lambda`;
    // response and status of HTTP endpoint
    const responseBody = {
        message: ""
    };
    let responseCode = 200;
    // SQS message parameters
    const params = {
        MessageBody: event.body,
        QueueUrl: queueUrl,
    };
    sqs.sendMessage(params, (error, data) => {
        if (error) {
            console.info("error:", `failed to send message${error}`);
            responseCode = 500;
        } else {
            console.info("data:", data.MessageId);
            responseBody.message = `Sent to ${queueUrl}`;
            responseBody.messageId = data.MessageId;
        }
        const response = {
            statusCode: responseCode,
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(responseBody),
        };
        callback(null, response);
    });
};