import * as express from "express";

export abstract class RequestHandler{
    protected static readonly HTTP_HEADERS:{[header:string]: string} = {

    };

    protected static readonly CORS_HEADERS:{[header:string]: string} = {
        "Access-Control-Allow-Headers": "Access-Control-Allow-Origin",
        "Access-Control-Allow-Origin": "*"
    };

    // reads the HTTP post body and JSON parses it
    protected loadPostBody(req:express.Request, cb:(err:Error, json?:any)=>any):void{
        let data:string = "";

        req.on("data", chunk => data += chunk);
        req.on("error", err => cb(err));
        req.on("end", () => {
            let json:any = null;

            try{
                json = JSON.parse(data);
            }
            catch(err){
                cb(err);
                return;
            }

            cb(null, json || {});
        });
    }
}