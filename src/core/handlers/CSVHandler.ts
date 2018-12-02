import * as express from "express";
import { RequestHandler } from "./RequestHandler";
import { DBController } from "../../database/DBController";
import { CSVBuilder } from "../../utils/CSVBuilder";

export class CSVHandler extends RequestHandler{
    private _database:DBController;

    constructor(){
        super();

        this._database = null;
    }

    // asychronously loads docs from the database and generates a csv file 
    public makeCSV(urls:string[]):Promise<string>{
        return new Promise((resolve, reject) => {
            if(urls.length === 1){
                this._database.find(urls[0])
                    .then(doc => resolve(CSVBuilder.makeCSV(doc)))
                    .catch(err => reject(err));
            }
            else{
                this._database.findMany(urls).then(docs => {
                    resolve(CSVBuilder.makeMergedCSV(docs));
                });
            }
        });
    }

    public database(db:DBController):CSVHandler{
        this._database = db;
        return this;
    }

    public get(req:express.Request, res:express.Response):void{
        if("urls" in req.query){
            let urls:string[] = decodeURIComponent(req.query.urls).split(",").map(url => url.trim());

            this.makeCSV(urls)
                .then(csv => {
                    // copy headers and attach file headers
                    let headers:{[header:string]: string} = Object.assign(RequestHandler.CORS_HEADERS, {});
                    headers["Content-Disposition"] = "attachment; filename=data.csv";
                    headers["Content-Type"] = "text/csv";

                    res.writeHead(200, headers);
                    res.end(csv);
                })
                .catch(err => {
                    res.writeHead(400, RequestHandler.CORS_HEADERS);
                    res.end(`Error: ${err.message}.`);
                });
        }
        else{
            res.writeHead(400, RequestHandler.CORS_HEADERS);
            res.end(`Error: No URLs provided in query strings.`);
        }
    }
};

export default new CSVHandler();