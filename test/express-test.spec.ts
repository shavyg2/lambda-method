import { Server } from "http";
import express from "express";
import Api from "../index";
import fetch from "node-fetch";
import join from "url-join";
const getPort = require("get-port-sync");
import path from "path";
var MockExpressRequest = require('mock-express-request');
var MockExpressResponse = require('mock-express-response');
import mock from "node-mocks-http";

describe("Test Api", () => {
  // let server: Server;
  // const app = express();
  // const port = getPort();
  // let endpoint = `http://localhost:${port}`;
  // function url(urlPath: string) {
  //   return join(endpoint, urlPath);
  // }
  // beforeAll(async => {
  //   server = app.listen(port, async);

  //   app.use(
  //     "/hello",
  //     Api.fold(
  //       Api.get((req, res) => {
  //         return { message: "hello" };
  //       })
  //     )
  //   );

  //   app.use(
  //     "/hello/put",
  //     Api.fold(
  //       Api.put((req, res) => {
  //         return { message: "put" };
  //       }),
  //       Api.get((req, res) => {
  //         return { message: "hello" };
  //       })
  //     )
  //   );
  // });

  // afterAll(() => {
  //   server.close();
  // });

  // it("should be able to create a hello world get request", async () => {
  //   const endpoint = url("/hello");
  //   const result = await (await fetch(endpoint)).json();
  //   expect(result.message).toBe("hello");
  // });

  // it("should not be able to create a hello world post request", async () => {
  //   const endpoint = url("/hello");
  //   const result = await (
  //     await fetch(endpoint, {
  //       method: "post"
  //     })
  //   ).json();
  //   expect(result.message).toBe("not found");
  // });

  // it("should not be able to create a hello world put request", async () => {
  //   const endpoint = url("/hello/put");
  //   const result = await (
  //     await fetch(endpoint, {
  //       method: "put"
  //     })
  //   ).json();
  //   expect(result.message).toBe("not found");
  // });


  it("should be able to throw an error",async()=>{

    const req = mock.createRequest({
      method:"PUT"
    })
    const res = mock.createResponse({
      req:req
    })


    const result = await Api.fold(Api.put((req,res,next)=>{


      throw {
        code:401,
        message:"bad data"
      }

    }))(req,res,null);


    console.log(result);



  })
});
