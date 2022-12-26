const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromPhoneNumber = process.env.FROM_PHONE_NUMBER;
const client = require("twilio")(accountSid, authToken);

exports.handler = async (event) => {
  console.log("----------------------------------------");
  console.log(event);
  let statusCode = 200;
  const headers = {
    "Content-Type": "application/json",
  };
  let body;
  try {
    let requestJSON = JSON.parse(event.body);
    console.log(requestJSON);
    var d = new Date();
    var datestring = `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
    requests = [];
    requestJSON.forEach(async (element) => {
      let message;
      if (element.type === "reminder") {
        message = `Hi ${element.name}, this is a reminder that you have to test today. \r\nPlease report to Health and Safety first thing before starting any work. Thanks.`;
      }
      if (element.type === "result") {
        if (element.test.result === "Positive") {
          message = `Hi ${element.name}, your COVID ${element.test.method} has returned a POSITIVE result on ${datestring}.\r\nPlease isolate away from others right away and a member of the Health & Safety Team will be in contact right away.`;
        }
        if (element.test.result === "Negative") {
          message = `Hi ${element.name}, your COVID ${element.test.method} has returned a NEGATIVE result on ${datestring}.\r\nPlease see a COVID PA at the entrances for a bracelet.`;
        }
      }
      console.log(message);

      requests.push(
        client.messages.create({
          body: message,
          from: fromPhoneNumber,
          to: element.phonne,
        })
      );
    });
    body = await Promise.all(requests);
    console.log(body);
  } catch (err) {
    statusCode = 400;
    body = err.message;
  } finally {
    body = JSON.stringify(body);
  }
  return {
    statusCode,
    body,
    headers,
  };
};
