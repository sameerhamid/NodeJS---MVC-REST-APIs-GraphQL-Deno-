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
});

/*listen starts a process for node 
js will not emidiatly exit our script
 but node js will instead keep this running to listen for incomming requests
 -> 
 */
server.listen(3000);
