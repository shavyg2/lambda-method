const chain = require("chain-middleware");
import is from "@sindresorhus/is";

const Progress = Symbol.for("continue");

function Next(req: any, res: any, func: ApiFunction[]) {

  let position = 0;

  function next(err?: any) {
    let status = 500;

    if (err) {
      if (is.primitive(err)) {
        res.status(status).send(err);
      } else if (is.object(err)) {
        res.status(status).json(err);
      } else {
        res.status(status).send(err);
      }
      res.status(500).send(err);
    } else {
      let doing = func[position];

      if (doing) {
        doing(req, res, next);
      } else {
        res.status(404).json({
          message: "not found"
        })
      }
    }

    position++;

  }

  next();
}

export type ApiFunction = (
  req: import("express").Request,
  res: import("express").Response,
  next?: import("express").NextFunction
) => any | Promise<any>;


type Params = (ApiFunction | number)[];

export function Api(...funcs: Params) {

  let apis = funcs.filter(x => is.function_(x)) as ApiFunction[];
  let returnCodes = funcs.filter(x => is.number(x)) as number[];
  const status = is.number(returnCodes[0]) ? returnCodes[0] : 200;

  const handler = apis.pop();

  const apiFunction = (req: any, res: import("express").Response, next: any) => {
    Promise.resolve(
      new Promise((r, j) => {
        try {
          r(handler(req, res, next));
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
          const { code, ...data } = e as any;
          if (is.number(code)) {
            return res.status(code).json(data);
          } else {
            return res.status(500).json(e);
          }
        } else {
          return res.send(e);
        }
      });
  };


  return (req: any, res: any) => {
    return Next(req, res, [...apis, apiFunction])
  }
}


const Alt = Api;

export namespace Api {


  function makeMethod(method: string) {
    return (...api: Params) => {
      const fun: ApiFunction = (req, res) => {
        if (req.method.toLocaleLowerCase() === method.toLowerCase()) {
          return Alt(...api)(req, res);
        } else {
          return Progress;
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


  export function fold(...params: Params) {
    return (req: any, res: any, next: any) => {
      let possibleResultCode = params.filter(x => is.number(x));
      let funcs = params.filter(x => is.function_(x)) as ApiFunction[];
      const result = funcs.reduce((result: any, handler) => {
        const handlerResult = handler(req, res, next);
        if (handlerResult === Progress) {
          return Progress
        } else {
          return Alt(handlerResult, ...possibleResultCode);
        }
      }, Progress);

      if (result === Progress) {
        res.status(404).json({
          message: "not found"
        })
      }
    }
  }
}

export default Api;