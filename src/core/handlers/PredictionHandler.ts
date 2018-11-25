import * as express from "express";
import * as tf from "@tensorflow/tfjs";
import { RequestHandler } from "./RequestHandler";
import { DBController } from "../../database/DBController";
import { DocumentSchema } from "../../database/DocumentSchema";

// https://www.npmjs.com/package/@tensorflow/tfjs

export class PredictionHandler extends RequestHandler{
    private _database:DBController;

    constructor(){
        super();

        this._database = null;
    }

    // predicts if a page is about the topic
    // (TEST - always returns true!)
    private predictPage(doc:DocumentSchema, model:tf.Model, results:any):void{
        let testData = this.getTestData(doc.words);
        let {xValues, yValues} = testData;

        let testXs:tf.Tensor = tf.tensor(xValues);
        let testYs:tf.Tensor = tf.tensor(yValues);

        results[doc.url] = true;
    }

    // creates a linear regression model (NOT fitted)
    public linearRegressionModel():tf.Sequential{
        // linear regression model
        let model:tf.Sequential = tf.sequential();
        let layer:tf.layers.Layer = tf.layers.dense({units: 1, inputShape: [1]});
        model.add(layer);
        
        // prepare for learning
        model.compile({loss: "meanSquaredError", optimizer: "sgd"});
        return model;
    }

    // converts a word dictionary ({wordStr: wordFrequencyNum}) to [wordStr...], [wordFreq...]
    public getTestData(wordDict:{[word: string]: number}):{xValues:number[], yValues:number[]}{
        let xValues:number[] = [];
        let yValues:number[] = [];

        for(let word in wordDict){
            xValues.push(word.charCodeAt(0));
            yValues.push(wordDict[word]);
        }

        return {xValues, yValues};
    }

    public database(db:DBController):PredictionHandler{
        this._database = db;
        return this;
    }

    public post(req:express.Request, res:express.Response):void{
        // read the http request 
        this.loadPostBody(req, (err, json) => {
            if(!err){
                if("topic" in json && "urls" in json){
                    // extract data from json 
                    let {topic, urls} = json;

                    // load topic training data
                    this._database.findTrainingData(topic)
                        .then(trainingData => {
                            // load document scrape data for each doc 
                            this._database.findMany(urls).then(docs => {
                                // print message if not all the urls' data could be retrieved
                                // this could invalid results, prehaps handle this differently? 
                                if(docs.length < urls.length){
                                    console.log(`Prediction 'error': ${urls.length} docs, got ${docs.length}.`)
                                }

                                // create a linear regression model
                                let model:tf.Sequential = this.linearRegressionModel();

                                // get training data arrays
                                let trainXs:tf.Tensor = tf.tensor(trainingData.trainX.map(word => word.charCodeAt(0)));
                                let trainYs:tf.Tensor = tf.tensor(trainingData.trainY);

                                // results dictionary, predicted results stored here
                                let results:{[url:string]: boolean} = {};

                                // model fit & predict 
                                model.fit(trainXs, trainYs).then(() => {
                                    // for each given page - predict
                                    // prediction is stored in results dictionary (key = url)
                                    docs.forEach(doc => this.predictPage(doc, model, results));

                                    // respond
                                    res.writeHead(200, RequestHandler.CORS_HEADERS);
                                    res.end(JSON.stringify(results));
                                });
                            });
                        })
                        .catch(err => {
                            res.writeHead(400, RequestHandler.CORS_HEADERS);
                            res.end(`Training data for topic "${topic}" does not exist.`); 
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