import * as express from "express";
import * as http from "http";
import { MongoClient } from 'mongodb';
import { DBController, DocumentSchema } from './DBController';
import { DocumentLoader } from "./DocumentLoader";
import { CSVBuilder } from "./CSVBuilder";

// HTTP webserver using Express.js
export class WebServer{
    // default HTTP headers, allows CORS
    private static readonly HTTP_HEADERS:{[header:string]: string} = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Access-Control-Allow-Origin"
    };

    private static readonly HTTP_FILE_HEADERS:{[header:string]: string} = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Access-Control-Allow-Origin",
        "Content-Type": "text/csv",
        "Content-Disposition": "attachment; filename=data.csv"
    };

    private _app:express.Application            // express instance
    private _server:http.Server;                // http server
    private _database:DBController;             // mongodb connection manger

    constructor(){
        this._app = express().use(express.static(`${__dirname}/../react/build`));
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

        // loads/parses web page from internet (stores in database)
        this._app.post("/api/page/scrape", (req, res) => {
            this.readHttpPost(req, (err, json) => {
                if(!err){
                    if("urls" in json && json.urls instanceof Array){
                        let urls:string[] = json.urls;

                        if(urls.length === 1){
                            this.scrapePage(urls[0])
                                .then(resp => {
                                    res.writeHead(200, WebServer.HTTP_HEADERS);
                                    res.end(resp.message);
                                })
                                .catch(err => {
                                    res.writeHead(400, WebServer.HTTP_HEADERS);
                                    res.end(err.message);
                                });
                        }
                        else{
                            this.scrapePages(urls).then(resp => {
                                res.writeHead(200, WebServer.HTTP_HEADERS);
                                res.end(resp.message);
                            });
                        }
                    }
                    else{
                        res.writeHead(400, WebServer.HTTP_HEADERS);
                        res.end(`Error: urls must be an Array of strings specified in the json.`);
                    }
                }
                else{
                    res.writeHead(400, WebServer.HTTP_HEADERS);
                    res.end(`Error parsing json.`);
                }
            });
        });

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
                    res.end(`Error: "${url}" not in database. (See API endpoint for loading it)`);
                });
        });

        // retrieves csv files
        this._app.get("/api/page/csv", (req, res) => {
            if("urls" in req.query){
                let urls:string[] = decodeURIComponent(req.query.urls).split(",");

                if(urls.length === 1){
                    this._database.get(urls[0])
                        .then(doc => {
                            res.writeHead(200, WebServer.HTTP_HEADERS);
                            res.end(CSVBuilder.makeCSV(doc));
                        })
                        .catch(err => {
                            res.writeHead(400, WebServer.HTTP_FILE_HEADERS);
                            res.end(`Error: ${urls[0]} not in database.`);
                        });
                }
                else{
                    this.getManyDBDocs(urls).then(docs => {
                        res.writeHead(200, WebServer.HTTP_FILE_HEADERS);
                        res.end(CSVBuilder.makeMergedCSV(docs));
                    });
                }
            }
            else{
                res.writeHead(400, WebServer.HTTP_HEADERS);
                res.end(`Error: No URLs provided in query strings.`);
            }
        });

        this._app.post("/api/train/:topic", (req, res) => {
            this.readHttpPost(req, (err, json) => {
                if(!err){
                    if("urls" in json && json.urls instanceof Array){
                        let {urls} = json;
                        let topic = req.param("topic").toLowerCase();

                        // gather the data
                        this.scrapePages(urls).then(report => {
                            if(!report.errs){
                                
                            }
                            else{
                                res.writeHead(400, WebServer.HTTP_HEADERS);
                                res.end(`Error: ${report.errs} urls could be scraped.`);
                            }
                        });

                        res.writeHead(200, WebServer.HTTP_HEADERS);
                        res.end("Training is not yet implemented.");
                    }
                    else{
                        res.writeHead(400, WebServer.HTTP_HEADERS);
                        res.end(`Error: urls must be an Array of strings specified in the json`);
                    }
                }
                else{
                    res.writeHead(400, WebServer.HTTP_HEADERS);
                    res.end(`Error parsing json.`);
                }
            });
        });
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

    private pythonAPI(task:"train"|"predict", urls:string[]):Promise<any>{
        return new Promise((resolve, reject) => {
            let options = {

            };

            let req:http.ClientRequest = http.request(options, res => {

            });

            req.on("error", err => reject(err));
        });
    }

    // retrieves multiple docs from the database
    private getManyDBDocs(urls:string[]):Promise<DocumentSchema[]>{
        return new Promise((resolve, reject) => {
            let numDone:number = 0;
            let results:DocumentSchema[] = [];

            urls.forEach(url => {
                this._database.get(url)
                    .then(doc => {
                        results.push(doc);
                    })
                    .catch(err => {})
                    .then(() => {
                        if(++numDone === urls.length){
                            resolve(results);
                        }
                    });
            }); 
        });
    }

    // loads a web page off the internet and parses it
    // auto saves to database on success
    private scrapePage(url:string):Promise<{message: string}>{
        return new Promise((resolve, reject) => {
            // page already loaded?
            this._database.get(url)
                .then(data => {
                    if(data.algorithm_revision !== DocumentLoader.SCRAPE_ALGORITHM_REVISION){
                        // in database, but scraping is no longer valid because algo changed
                        throw new Error("Revision error.");
                    }
                    else{
                        // already loaded, no need to reload (resolve the 'cache')
                        resolve({message: `${url} scraped (data was cached).`});
                    } 
                })
                .catch(err => {
                    // does not exist... load it
                    DocumentLoader.scrape(url)
                        .then(words => {
                            // successful load - store in db
                            this._database.insert(url, words);
                            resolve({message: `${url} scraped.`});
                        })
                        .catch(err => {
                            // load failed
                            reject(err);
                        });
                });
        });
    }

    // laoads multiple web pages and saves them to DB
    private scrapePages(urls:string[]):Promise<{message: string, errs:number}>{
        return new Promise((resolve, reject) => {
            let numDone:number = 0;
            let errs:number = 0;

            urls.forEach(url => {
                this.scrapePage(url)
                    .catch(err => errs++)
                    .then(() => {
                        if(++numDone === urls.length){
                            resolve({message: `${numDone-errs}/${urls.length} scraped.`, errs});
                        }
                    });
            });
        });
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