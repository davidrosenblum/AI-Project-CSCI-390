import * as express from "express";
import { RequestHandler } from "./RequestHandler";
import { DBController } from "../../database/DBController";
import { DocumentSchema } from "../../database/DocumentSchema";
import { TrainingDataSchema } from "../../database/TrainingDataSchema";
import { CSVBuilder } from "../../utils/CSVBuilder";
import { TrainingSetSchema } from "../../database/TrainingSetSchema";

export class TrainingHandler extends RequestHandler{
    private _database:DBController;

    constructor(){
        super();

        this._database = null;
    }

    private createTrainingSet(topic:string, docs:DocumentSchema[]):TrainingSetSchema{
        let trainingData:TrainingSetSchema = {topic, trainX: [], trainY: []};

        docs.forEach(doc => {
            let trainX:string[] = [];
            let trainY:number[] = [];

            for(let word in doc.words){
                trainX.push(word);
                trainY.push(doc.words[word]);
            }

            trainingData.trainX.push(trainX);
            trainingData.trainY.push(trainY);
        });

        return trainingData;
    }

    /*private createTrainingData(topic:string, docs:DocumentSchema[]):TrainingDataSchema{
        let aggregateWords:{[word:string]: number} = CSVBuilder.aggregateWordDictionary(docs);

        let trainX:string[] = [];
        let trainY:number[] = [];

        for(let word in aggregateWords){
            trainX.push(word);
            trainY.push(aggregateWords[word]);
        }

        return {topic, trainX, trainY};
    }*/

    public database(db:DBController):TrainingHandler{
        this._database = db;
        return this;
    }

    public post(req:express.Request, res:express.Response):void{
        this.loadPostBody(req, (err, json) => {
            if(!err){
                if("topic" in json && "urls" in json){
                    let {topic, urls} = json;

                    this._database.findTrainingSet(topic)
                        .then(model => {
                            // - possibly update data -
                            res.writeHead(400, RequestHandler.CORS_HEADERS);
                            res.end(`Training model already exists for topic "${topic}"`);
                        })
                        .catch(err => {
                            this._database.findMany(urls.map(url => url.trim())).then(docs => {
                                let model:TrainingSetSchema = this.createTrainingSet(topic, docs);
                                
                                this._database.insertTrainingSet(model)
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