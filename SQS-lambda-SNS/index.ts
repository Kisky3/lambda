// Load the AWS SDK for Node.js
var AWS = require('aws-sdk');
// Set region
AWS.config.update({region: 'ap-northeast-1'});


exports.handler = async (event, context) => {
    console.log('Received event:', JSON.stringify(event, null, 2));
    for (const { messageId, body } of event.Records) {
        console.log('SQS message %s: %j', messageId, body);
    }

    // Create publish parameters
    const message = event.Records[0].body;

    let topic_ios = "";
    let topic_android = "";

    // Get SQS functionName
    const functionName = context.functionName;

    if ( functionName === 'app-push-prod' ) {
        topic_ios = 'arn:aws:sns:ap-northeast-1:xxxxxxxxx:app-ios-all';
        topic_android = "arn:aws:sns:ap-northeast-1:xxxxxxxxx:app-android-all";
      } else {
        topic_ios = 'arn:aws:sns:ap-northeast-1:xxxxxxxxx:app-dev-ios-all';
        topic_android = "arn:aws:sns:ap-northeast-1:xxxxxxxxx:app-dev-android-all";
    }

    let params = {}
    if (JSON.parse(message)["aps"]) {
        params = {
            TargetArn: topic_ios,
            Message: JSON.stringify({
                default:message,
                APNS:message
            }),
            MessageStructure: 'json'
        };
    }
    else{
        params = {
            TargetArn: topic_android,
            Message: JSON.stringify({
                default:message,
                GCM:message
            }),
            MessageStructure: 'json'
        };
    }

    // Create promise and SNS service object
    const publishTextPromise = new AWS.SNS().publish(params).promise();

    // Handle promise's fulfilled/rejected states
    await publishTextPromise.then(
      function(data) {
        console.log(`Message ${params.Message} sent to the topic ${params.TopicArn}`);
        console.log("MessageID is " + data.MessageId);
      }).catch(
        function(err) {
        console.error(err, err.stack);
      });

    return `Successfully processed ${event.Records.length} messages.`;

};

