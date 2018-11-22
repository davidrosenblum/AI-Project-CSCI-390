import * as express from "express";
import * as tf from "@tensorflow/tfjs";
import { RequestHandler } from "./RequestHandler";
import { DBController } from "../../database/DBController";
import { TrainingDataSchema } from "../../database/TrainingDataSchema";

// https://www.npmjs.com/package/@tensorflow/tfjs

export class PredictionHandler extends RequestHandler{
    private _database:DBController;

    constructor(){
        super();

        this._database = null;
    }

    public createTrainingModel(trainingData:TrainingDataSchema):tf.Sequential{
        let model:tf.Sequential = tf.sequential();

        model.compile({loss: "meanSquaredError", optimizer: "sgd"});

        return model;
    }

    public database(db:DBController):PredictionHandler{
        this._database = db;
        return this;
    }

    public post(req:express.Request, res:express.Response):void{
        this.loadPostBody(req, (err, json) => {
            if(!err){
                if("topic" in json && "urls" in json){
                    let {topic, urls} = json;

                    this._database.findMany(urls).then(() => {
                        this._database.findTrainingData(topic)
                        .then(trainingData => {
                            let model:tf.Sequential = this.createTrainingModel(trainingData);

                            // model fit & predict 

                        })
                        .catch(err => {
                            res.writeHead(400, RequestHandler.CORS_HEADERS);
                            res.end(`Model for topic "${topic}" does not exist.`); 
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

export default new PredictionHandler();