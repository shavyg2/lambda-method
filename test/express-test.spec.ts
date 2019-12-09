import { Server } from "http"
import express from "Express";
import Api from "../index";
import fetch from "node-fetch";
import join from "url-join";
const getPort= require("get-port-sync");
import path from "path";

describe("Test Api",()=>{

    let server:Server;
    const app = express();
    const port = getPort();
    let endpoint = `http://localhost:${port}`;
    function url(urlPath:string){
        return join(endpoint,urlPath);
    }
    beforeAll((async)=>{
        server = app.listen(port,async);
        
        app.use("/hello",Api.fold(Api.get((req,res)=>{
            return {message:"hello"};
        })));
    })


    afterAll(()=>{
        server.close();
    })



    it("should be able to create a hello world get request",async ()=>{

        const endpoint = url("/hello");
        const result = await (await fetch(endpoint)).json();
        expect(result.message).toBe("hello")

    });


    it("should not be able to create a hello world post request",async ()=>{
        const endpoint = url("/hello");
        const result = await (await fetch(endpoint,{
            method:"post"
        })).json();
        expect(result.message).toBe("not found")
    });

})