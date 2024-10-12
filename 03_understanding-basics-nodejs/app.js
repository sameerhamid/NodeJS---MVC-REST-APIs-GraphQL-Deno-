const http = require("http");

// const rqListner = (req, res) => { };

// http.createServer(rqListner);

// const server = http.createServer((req, res) => {
//   console.log(req);
// });

const server = http.createServer((req, res) => {
  console.log("url>>>>>", req.url);
  console.log("method >>>", req.method);
  console.log("headers >>>>>", req.headers);

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
    <h2>Hello from my node js server</h2>
</body>
</html>
        `);
  // end stops wring
  res.end();
});

/*listen starts a process for node 
js will not emidiatly exit our script
 but node js will instead keep this running to listen for incomming requests
 -> 
 */
server.listen(3000);
