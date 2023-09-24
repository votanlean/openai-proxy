const express = require("express");
const https = require("https");

const app = express(); // create an instance of express
app.use(express.json()); // for parsing application/json

// Setup the server to listen on port 3000 and print the log in the console
app.listen(3000, () => {
  console.log("listening on port 3000");
});

// Route to return hello world
app.all("*", (req, res) => {
  callOpenAI(req, res);
});

const callOpenAI = async (clientRequest, clientResponse) => {
  const options = {
    hostname: "api.openai.com",
    path: clientRequest.path, // use client request path
    method: clientRequest.method, // use client request method
    headers: {
      "Content-Type": clientRequest.headers['content-type'] || "application/json", // use client request headers
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, // Only OPEN AI API key is provided by the proxy
    },
  };

  // Create a request object with the options
  // It will be called by the request.end() function
  const openaiRequest = https.request(options, (openaiResponse) => {

    clientResponse.setHeader("Content-Type", openaiResponse.headers["content-type"]);

    // We receive the response in chunks via the "data" event
    openaiResponse.on("data", (chunk) => {
      clientResponse.write(chunk);
    });

    // We are done receiving the response when the "end" event is emitted
    openaiResponse.on("end", () => {
      clientResponse.end();
    });
  });

  openaiRequest.write(JSON.stringify(clientRequest.body)); // Add the payload to the request

  openaiRequest.end(); // Activate the request
};



