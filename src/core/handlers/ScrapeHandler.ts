import * as express from "express";
import { RequestHandler } from "./RequestHandler";
import { DBController } from "../../database/DBController";
import { DocumentLoader } from "../DocumentLoader";

export class ScrapeHandler extends RequestHandler{
    private _database:DBController;

    constructor(){
        super();

        this._database = null;
    }

    // loads a web page off the internet and parses it
    // auto saves to database on success
    public scrapePage(url:string):Promise<{message: string}>{
        return new Promise((resolve, reject) => {
            // page already loaded?
            this._database.find(url)
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
    public scrapePages(urls:string[]):Promise<{message: string, errs:number}>{
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

    public database(db:DBController):ScrapeHandler{
        this._database = db;
        return this;
    }

    public post(req:express.Request, res:express.Response):void{
        this.loadPostBody(req, (err, json) => {
            if(!err){
                if("urls" in json && json.urls instanceof Array){
                    let urls:string[] = json.urls;

                    if(urls.length === 1){
                        this.scrapePage(urls[0])
                            .then(resp => {
                                res.writeHead(200, RequestHandler.CORS_HEADERS);
                                res.end(resp.message);
                            })
                            .catch(err => {
                                res.writeHead(400, RequestHandler.CORS_HEADERS);
                                res.end(err.message);
                            });
                    }
                    else{
                        this.scrapePages(urls).then(resp => {
                            res.writeHead(200, RequestHandler.CORS_HEADERS);
                            res.end(resp.message);
                        });
                    }
                }
                else{
                    res.writeHead(400, RequestHandler.CORS_HEADERS);
                    res.end(`Error: urls must be an Array of strings specified in the json.`);
                }
            }
            else{
                res.writeHead(400, RequestHandler.CORS_HEADERS);
                res.end(`Error parsing json.`);
            }
        });
    }
}

export default new ScrapeHandler();