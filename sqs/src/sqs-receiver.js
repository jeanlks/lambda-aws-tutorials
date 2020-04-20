exports.handler = (event, context, callback) => {
    const response = {
        statusCode: 200,
        body: JSON.stringify({
            message: "SQS event processed.",
            input: event,
        }),
    };
    console.info("event:", JSON.stringify(event));
    callback(null, response);
};