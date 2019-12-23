import is from "@sindresorhus/is";

const IncorrectApiMethod = Symbol.for("continue");

const NotFoundStandardMessage = {
  message: "not found"
};


function Next(req: any, res: any, allHandlers: ApiFunction[]) {

  let handlerPosition = 0;

  function next(err?: any) {
    let status = 500;

    if (err) {
      handleNextError(err, res, status);
    } else {
      let currentHandler = allHandlers[handlerPosition];
      if (currentHandler) {
        currentHandler(req, res, next);
      } else {
        res.status(404).json(NotFoundStandardMessage)
      }
    }

    handlerPosition++;

  }

  next();
}

export type ApiFunction = (
  req: import("express").Request,
  res: import("express").Response,
  next?: import("express").NextFunction
) => any | Promise<any>;


type Params = (ApiFunction | number)[];

function handleNextError(err: any, res: any, status: number) {
  if (is.primitive(err)) {
    res.status(status).send(err);
  }
  else if (is.object(err)) {
    res.status(status).json(err);
  }
  else {
    res.status(status).send(err);
  }
  res.status(status).send(err);
}

export function Api(...ApiParameters: Params) {

  let [mainHandler, ...middlewareHandlers] = ApiParameters.reverse().filter(x => is.function_(x)) as ApiFunction[];
  let returnCodes = ApiParameters.filter(x => is.number(x)) as number[];
  const defaultStatusCode = is.number(returnCodes[0]) ? returnCodes[0] : 200;

  const promiseResolvingHandler = (req: any, res: import("express").Response, next: any) => {
    return Promise.resolve(
      new Promise((r, j) => {
        try {
          r(mainHandler(req, res, next));
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
          res.status(defaultStatusCode).send(data);
        } else if (is.object(data)) {
          res.status(defaultStatusCode).json(data);
        } else {
          res.status(defaultStatusCode).send(data);
        }
      })
      .catch(e => {
        console.log(e);
        if (is.error(e)) {
          res.status(500).json({
            message: e.message,
            stack: e.stack
          });
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
    return Next(req, res, [...middlewareHandlers, promiseResolvingHandler])
  }
}


const ApiFunction = Api;

export namespace Api {


  function createApiMethodHandler(method: string) {
    const handler = (...apiParameters: Params) => {
      const methodAwareHandler: ApiFunction = (req, res) => {
        if (req.method.toLocaleLowerCase() === method.toLowerCase()) {
          return ApiFunction(...apiParameters)(req, res);
        } else {
          return IncorrectApiMethod;
        }
      }
      return methodAwareHandler;
    }

    return handler;
  }


  export const get = createApiMethodHandler("get")

  export const post = createApiMethodHandler("post");

  export const put = createApiMethodHandler("put");

  export const del = createApiMethodHandler("delete");

  export const checkout = createApiMethodHandler("checkout");

  export const copy = createApiMethodHandler("copy");

  export const head = createApiMethodHandler("head");


  export const lock = createApiMethodHandler("lock");


  export const merge = createApiMethodHandler("merge");

  export const mkactivity = createApiMethodHandler("mkactivity");


  export const mkcol = createApiMethodHandler("mkcol");


  export const move = createApiMethodHandler("move");


  export const msearch = createApiMethodHandler("m-search");


  export const notify = createApiMethodHandler("notify");


  export const options = createApiMethodHandler("options");


  export const patch = createApiMethodHandler("patch");


  export const purge = createApiMethodHandler("purge")

  export const report = createApiMethodHandler("report");

  export const search = createApiMethodHandler("search");


  export const subscribe = createApiMethodHandler("subscribe");


  export const trace = createApiMethodHandler("trace");


  export const unlock = createApiMethodHandler("unlock");

  export const unsubscribe = createApiMethodHandler("unsubscribe");


  export function fold(...params: Params) {
    return (req: any, res: any, next: any) => {
      let possibleResultCode = params.filter(x => is.number(x));
      let funcs = params.filter(x => is.function_(x)) as ApiFunction[];
      const result = funcs.reduce((result: any, handler) => {

        if(result!=IncorrectApiMethod){
          return result;
        }
        const handlerResult = handler(req, res, next);
        if (handlerResult === IncorrectApiMethod) {
          return IncorrectApiMethod
        } else {
          return ApiFunction(handlerResult, ...possibleResultCode);
        }
      }, IncorrectApiMethod);

      if (result === IncorrectApiMethod) {
        res.status(404).json(NotFoundStandardMessage)
      }
    }
  }
}

export default Api;