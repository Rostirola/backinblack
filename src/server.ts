import express, { response } from "express";
import { router } from "./router/index";

const server = express();
const port = 3333;

server.use(express.json());
server.use(router);

server.listen(port, () => {
  console.log(`Server Running - end: http://localhost:${port}`);
});