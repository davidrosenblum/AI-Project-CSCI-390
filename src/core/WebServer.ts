import * as express from "express";
import * as http from "http";
import { MongoClient } from 'mongodb';
import { DBController } from "../database/DBController";
import CSVHandler from "./handlers/CSVHandler";
import ScrapeHandler from "./handlers/ScrapeHandler";

// HTTP webserver using Express.js
export class WebServer{
    // default HTTP headers, allows CORS
    private static readonly HTTP_HEADERS:{[header:string]: string} = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Access-Control-Allow-Origin"
    };

    private _app:express.Application            // express instance
    private _server:http.Server;                // http server
    private _database:DBController;             // mongodb connection manger

    constructor(){
        this._app = express().use(express.static(`${__dirname}/../react/build`));
        this._server = http.createServer(this._app);
        this._database = null;

        this.init(() => this.createRoutes());
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
        this._app.post("/api/page/scrape", ScrapeHandler.database(this._database).post.bind(ScrapeHandler));

        // retrieves csv files
        this._app.get("/api/page/csv", CSVHandler.database(this._database).get.bind(CSVHandler));
    }

    // starts the server
    private init(callback:()=>any):void{
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
                    callback();
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