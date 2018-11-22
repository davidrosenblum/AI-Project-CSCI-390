import * as express from "express";
import { RequestHandler } from "./RequestHandler";
import { DBController } from "../../database/DBController";
import { DocumentSchema } from "../../database/DocumentSchema";
import { ModelSchema } from "../../database/ModelSchema";
import { CSVBuilder } from "../../utils/CSVBuilder";

export class TrainingHandler extends RequestHandler{
    private _database:DBController;

    constructor(){
        super();

        this._database = null;
    }

    private createTrainingModel(topic:string, docs:DocumentSchema[]):ModelSchema{
        let aggregateWords:{[word:string]: number} = CSVBuilder.aggregateWordDictionary(docs);

        let trainX:string[] = [];
        let trainY:number[] = [];

        for(let word in aggregateWords){
            trainX.push(word);
            trainY.push(aggregateWords[word]);
        }

        return {topic, trainX, trainY};
    }

    public database(db:DBController):TrainingHandler{
        this._database = db;
        return this;
    }

    public post(req:express.Request, res:express.Response):void{
        this.loadPostBody(req, (err, json) => {
            if(!err){
                if("topic" in json && "urls" in json){
                    let {topic, urls} = json;

                    this._database.findModel(topic)
                        .then(model => {
                            res.writeHead(400, RequestHandler.CORS_HEADERS);
                            res.end(`Training model already exists for topic "${topic}"`);
                        })
                        .catch(err => {
                            this._database.findMany(urls).then(docs => {
                                let model:ModelSchema = this.createTrainingModel(topic, docs);
                                
                                this._database.insertModel(model)
                                    .then(() => {
                                        res.writeHead(200, RequestHandler.CORS_HEADERS);
                                        res.end(`Training model for topic "${topic}" saved.`);
                                    })
                                    .catch(err => {
                                        res.writeHead(400, RequestHandler.CORS_HEADERS);
                                        res.end(`Error saving training model. ${err}`);
                                    });
                            });
                        });
                }
                else{
                    res.writeHead(400, RequestHandler.CORS_HEADERS);
                    res.end(`Error json body must include topics string and urls string array.`);   
                }
            }
            else{
                res.writeHead(400, RequestHandler.CORS_HEADERS);
                res.end(`Error parsing json.`);
            }
        });
    }
}

export default new TrainingHandler();