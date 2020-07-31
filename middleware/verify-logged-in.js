const jwt = require("jsonwebtoken");

function verifyLoggedIn(request, response, next) {
  if (!request.headers.authorization) {
    response.status(401).send("You Are Not Logged in");
    return;
  }

  const token = request.headers.authorization.split(" ")[1];

  if (!token) {
    response.status(401).send("You Are Not Logged in");
    return;
  }

  jwt.verify(token, config.jwt.secretKey, (err, payload) => {
    if (err) {
      if (err.message == "jwt expired") {
        response.status(403).send("Your Login Session has expired");
        return;
      }
      response.status(401).send("You Are Not Logged in");
      return;
    }
    next();
  });
}

module.exports = verifyLoggedIn;
