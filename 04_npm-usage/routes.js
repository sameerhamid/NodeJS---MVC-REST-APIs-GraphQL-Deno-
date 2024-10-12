const fs = require("fs");
const requestHandler = (req, res) => {
  const { url, method } = req;

  if (url === "/") {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(`
            <!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>

<body>
    <form action="/message" method="POST">
        <input type="text" name="message" />
        <button type="submit">Submit</button>
    </form>
</body>

</html>
        `);

    return res.end();
  }

  if (url === "/message" && method === "POST") {
    let body = [];
    req.on("data", (chunck) => {
      body.push(chunck);
    });

    return req.on("end", () => {
      const parsedData = Buffer.concat(body).toString();
      const message = parsedData.split("=")[1];
      //   fs.writeFileSync("message.txt", message);

      // the error callback will be executed the the write operation is completed
      fs.writeFile("message.txt", message, (err) => {
        res.writeHead(302, {
          location: "/",
        });
        return res.end();
      });
    });
  }

  res.setHeader("Content-Type", "text/html");
  res.write(`
          <!DOCTYPE html>
  <html lang="en">

  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Document</title>
  </head>

  <body>
      <h2>Hello from node js</h2>
  </body>

  </html>
          `);
  res.end();
};

module.exports = requestHandler;
