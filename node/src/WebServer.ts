import * as express from "express";
import * as http from "http";
import { MongoClient } from 'mongodb';
import { DBController, DocumentSchema } from './DBController';
import { DocumentLoader } from "./DocumentLoader";

// HTTP webserver using Express.js
export class WebServer{
    // default HTTP headers, allows CORS
    private static readonly HTTP_HEADERS:{[header:string]: string} = {
        "Access-Control-Allow-Headers": "Access-Control-Allow-Origin,x-api-key,Access-Control-Allow-Headers",
        "Access-Control-Allow-Origin": "*"
    };

    private _app:express.Application            // express instance
    private _server:http.Server;                // http server
    private _database:DBController;             // mongodb connection manger

    constructor(){
        this._app = express().use(express.static(`${__dirname}/web/build`));
        this._server = http.createServer(this._app);
        this._database = null;

        this.createRoutes();  
        this.init();
    }

    // creates http routes
    private createRoutes():void{
        // serve static pages
        this._app.get("/", (req, res) => res.sendFile("index.html"));

        // options for all pages (CORS)
        this._app.options("*", (req, res) => {
            res.writeHead(200, WebServer.HTTP_HEADERS);
            res.end();
        });

        // loads database from internet (stores in database)
        this._app.post("/api/page/load", this.handleAPILoadPage.bind(this));

        // retrieves page data from database
        this._app.get("/api/page/get/:url", (req, res) => {
            let url:string = decodeURIComponent(req.params.url);

            this._database.get(url)
                .then(result => {
                    res.writeHead(200, WebServer.HTTP_HEADERS);
                    res.end(result);
                })
                .catch(err => {
                    res.writeHead(400, WebServer.HTTP_HEADERS);
                    res.end(`ERR: "${url}" not in database. (See API endpoint for loading it)`);
                });
        });
    }

    // handler for when a load request comes in
    private handleAPILoadPage(req:express.Request, res:express.Response):void{
        // must have secret key
        if(req.headers["x-api-key"] === "darksoulsIII"){
            // parse json from post body...
            this.readHttpPost(req, (err, json) => {
                if(!err){
                    // extract url from json
                    let {url} = json;

                    if(!url){
                        // url is missing (very bad)
                        res.writeHead(400, WebServer.HTTP_HEADERS);
                        res.end("URL must be specified in post json body.");
                    }
                    else{
                        // url is present - load and parse the page
                        this.loadPage(url)  // (inserts results to DB on success)
                            .then(json => {
                                // successful page parse
                                let format:string = req.query.format || "json";
                                let out:string = null;

                                // json or csv output?
                                if(format === "csv")
                                    out = this.makeCSV(json);
                                else out = JSON.stringify(json, null, 4);
                            
                                // respond
                                res.writeHead(200, WebServer.HTTP_HEADERS);
                                res.end(out);
                            })
                            .catch(err => {
                                // error loading or parsing page
                                res.writeHead(400, WebServer.HTTP_HEADERS);
                                res.end(err.message);
                            });
                    }
                }
                else{
                    // error parsing json from post body
                    res.writeHead(400, WebServer.HTTP_HEADERS);
                    res.end("Error reading post body json.");
                }
            });
        }
        else{
            // secret key missing
            res.writeHead(403, WebServer.HTTP_HEADERS);
            res.end("Unauthorized access.")
        }
    }

    // reads the HTTP post body and JSON parses it
    private readHttpPost(req:express.Request, cb:(err:Error, json?:any)=>any):void{
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

    // loads a web page off the internet and parses it
    // auto saves to database on success
    private loadPage(url:string):Promise<DocumentSchema>{
        return new Promise((resolve, reject) => {
            // page already loaded?
            this._database.get(url)
                .then(data => {
                    // already loaded, no need to reload (resolve the 'cache')
                    resolve(data)
                })
                .catch(err => {
                    // does not exist... load it
                    DocumentLoader.seek(url)
                        .then(words => {
                            // successful load - store in db
                            this._database.insert(url, words);
                            resolve({url, words});
                        })
                        .catch(err => {
                            // load failed
                            reject(err);
                        });
                });
        });
    }

    // figures out the word frequency of a corpus 
    private aggregateWordDictionary(docs:DocumentSchema[]):{[word:string]: number}{
        let aggregateWords:{[word:string]: number} = {};

        docs.forEach(doc => {
            for(let word in doc.words){
                if(word in aggregateWords){
                    aggregateWords[word]++;
                }
                else{
                    aggregateWords[word] = 1;
                }
            }
        });

        return aggregateWords;
    }

    private makeMergedCSV(docs:DocumentSchema[]):string{
        let aggregateWords:{[word:string]: number} = this.aggregateWordDictionary(docs);

        let csv:string = "";

        docs.forEach(doc => {
            csv += `${doc.url},`;
            
            for(let word in aggregateWords){
                csv += `${word},${doc.words[word]}\n`;
            }
        });

        return csv;
    }

    // system uses json, but this method converts json (of this schema) to csv 
    private makeCSV(json:DocumentSchema):string{
        let words:string[] = [],
            counts:number[] = [];

        for(let word in json.words){
            words.push(word);
            counts.push(json.words[word]);
        }

        return words.join(",") + "\n" + counts.join(",");
    }

    // starts the server
    private init():void{
        console.log("AI Project - WebServer\n");

        // mongo config
        let url:string = process.env.MONGDB_URL || "mongodb://localhost:27017";
        let dbName:string = process.env.MONGDB_DB || "ai_proj";

        console.log("Connecting to MongoDB...");
        
        // connect to database
        MongoClient.connect(url, (err, db) => {
            if(!err){
                console.log("Connected to MongoDB.\n");   
                this._database = new DBController(db, dbName);

                // start http server
                let port:number = parseInt(process.env.PORT) || 8080;
                this._server.listen(port, () => {
                    console.log(`Http server listening on port ${port}.\n`);
                });
            }
            else{
                console.log(err.message);
                process.exit();
            }
        });
    }
}

if(require.main === module){
    new WebServer();
}