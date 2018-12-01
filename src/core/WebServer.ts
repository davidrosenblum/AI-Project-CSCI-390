import * as express from "express";
import * as http from "http";
import * as fs from "fs";
import { MongoClient } from 'mongodb';
import { DBController } from "../database/DBController";
import { WebServerSettings } from "./WebServerSettings";
import CSVHandler from "./handlers/CSVHandler";
import ScrapeHandler from "./handlers/ScrapeHandler";
import TrainingHandler from "./handlers/TrainingHandler";
import PredictionHandler from "./handlers/PredictionHandler";

// HTTP webserver using Express.js
export class WebServer{
    // default HTTP headers, allows CORS
    private static readonly HTTP_HEADERS:{[header:string]: string} = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Access-Control-Allow-Origin"
    };

    // default settings (Mongodb)
    private static readonly DEFAULT_SETTINGS:WebServerSettings = {
        "mongo_url":        "mongodb://localhost:27017",
        "mongo_database":   "ai_proj"
    };

    // settings file name
    private static readonly SETTINGS_PATH:string = "settings.json";

    private _app:express.Application            // express instance
    private _server:http.Server;                // http server
    private _database:DBController;             // mongodb connection manger

    constructor(){
        this._app = express().use(express.static(`${__dirname}/../../web/build`));
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

        // handle scrap requests 
        this._app.post("/api/page/scrape", ScrapeHandler.database(this._database).post.bind(ScrapeHandler));

        // handle csv file requests
        this._app.get("/api/page/csv", CSVHandler.database(this._database).get.bind(CSVHandler));

        // handle training requests
        this._app.post("/api/train", TrainingHandler.database(this._database).post.bind(TrainingHandler));

        // handle predicition requests
        this._app.post("/api/predict", PredictionHandler.database(this._database).post.bind(PredictionHandler));
    }

    // loads the settings json file 
    private loadSettings(callback:(err:Error, settings:WebServerSettings)=>any):void{
        fs.readFile(WebServer.SETTINGS_PATH, (err, data) => {
            if(!err){
                // file read - parse
                let settings = JSON.parse(data.toString());

                // apply missing or invalid type settings
                for(let setting in WebServer.DEFAULT_SETTINGS){
                    if(typeof settings[setting] !== typeof WebServer.DEFAULT_SETTINGS[setting]){
                        settings[setting] = WebServer.DEFAULT_SETTINGS[setting];
                    }
                }

                // success - trigger done callback  
                callback(null, settings as WebServerSettings);
            }
            else{
                // handle file missing error
                let defaultSettingsCopy:WebServerSettings = Object.assign({}, WebServer.DEFAULT_SETTINGS);

                if(err.errno === -4058){
                    // file missing - write default and callback default 
                    fs.writeFile(WebServer.SETTINGS_PATH, JSON.stringify(WebServer.DEFAULT_SETTINGS, null, 4), () => {
                        callback(null, defaultSettingsCopy);
                    });
                }
                // unhandled error
                else callback(err, defaultSettingsCopy);
            }
        }); 
    }

    // starts the server
    private init(callback:()=>any):void{
        console.log("AI Project - WebServer\n");

        console.log("Loading settings...");
        this.loadSettings((err, settings) => {
            if(settings){
                // settings loaded - connect to database
                console.log("Settings loaded.\n");

                // command line arg overrides (default to settings data)
                let mongoUrl:string = process.env.MONGO_URL || settings.mongo_url;
                let mongoDb:string = process.env.MONGO_DB || settings.mongo_database;

                console.log("Connecting to database...");
                MongoClient.connect(mongoUrl, {useNewUrlParser: true}, (err, db) => {
                    if(!err){
                        // database connected
                        console.log("Connected.\n");

                        // store connection 
                        this._database = new DBController(db, mongoDb);

                        // start http server
                        let port:number = parseInt(process.env.PORT) || 8080;
                        this._server.listen(port, () => {
                            console.log(`Http server listening on port ${port}.\n`);
                            callback();
                        });
                    }
                    else{
                        // database connection error
                        console.log(err.message);
                        process.exit();
                    }
                });
            }
            else{
                // settings error
                console.log("Settings file error.");
                console.log(err.message);
                console.log("WARNING: using default settings instead of exiting.");
            }
        });
    }
}

if(require.main === module){
    new WebServer();
}