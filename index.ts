import chain from "chain-middleware";

import is from "@sindresorhus/is";

export type ApiFunction = (
  req: import("express").Request,
  res: import("express").Response,
  next?: import("express").NextFunction
) => any | Promise<any>;


type Params = (ApiFunction|number)[];

export function Api(...funcs: Params) {

  let apis = funcs.filter(x=>is.function_(x)) as ApiFunction[];
  let stati = funcs.filter(x=>is.number(x)) as number[];
  const status = is.number(stati[0])?stati[0]:200; 

  const func = apis.pop();

  const final_function =  (req:any, res: import("express").Response, next:any) => {
    Promise.resolve(
      new Promise((r, j) => {
        try {
          r(func(req, res, next));
        } catch (e) {
          j(e);
        }
      })
    )
      .then(data => {
        if (res.headersSent) {
          return void 0;
        }

        if (is.primitive(data)) {
          res.status(status).send(data);
        } else if (is.object(data)) {
          res.status(status).json(data);
        } else {
          res.status(status).send(data);
        }
      })
      .catch(e => {
        console.log(e);
        if (is.error(e)) {
          res.status(500).send(
            `
<pre>
${e.message}:
${e.stack}
</pre>
`.trim()
          );
        } else if (is.object(e)) {
          res.status(500).json(e);
        } else {
          res.send(e);
        }
      });
  };


  return chain(...apis,final_function);
}


const Alt = Api;

export namespace Api{


    function makeMethod (method:string){
        return (...api:Params)=>{
            const fun:ApiFunction =  (req,res,next)=>{
                if(req.method.toLocaleLowerCase()===method.toLowerCase()){
                    return Alt(...api)(req,res,next);
                }else{
                    next();
                }
            } 

            return fun;
        } 
    }
    export const get = makeMethod("get")

    export const post = makeMethod("post");

    export const put = makeMethod("put");

    export const del = makeMethod("delete");

    export const checkout = makeMethod("checkout");

    export const copy = makeMethod("copy");

    export const head = makeMethod("head");


    export const lock = makeMethod("lock");


    export const merge = makeMethod("merge");

    export const mkactivity = makeMethod("mkactivity");


    export const mkcol = makeMethod("mkcol");


    export const move = makeMethod("move");


    export const msearch = makeMethod("m-search");


    export const notify = makeMethod("notify");


    export const options = makeMethod("options");


    export const patch = makeMethod("patch");


    export const purge = makeMethod("purge")

    export const report = makeMethod("report");

    export const search = makeMethod("search");


    export const subscribe = makeMethod("subscribe");


    export const trace = makeMethod("trace");


    export const unlock = makeMethod("unlock");

    export const unsubscribe = makeMethod("unsubscribe");


    export function fold(...params:Params){
        return (req:any,res:any,next:any)=>{
            let numbers = params.filter(x=>is.number(x)) ;
            let funcs = params.filter(x=>is.function_(x)) as ApiFunction[];
            funcs.forEach(func=>{
                Alt(func(req,res,next),...numbers);
            });
        }
    }
}

export default Api;