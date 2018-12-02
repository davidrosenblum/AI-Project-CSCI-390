import * as express from "express";
import * as tf from "@tensorflow/tfjs";
import * as fs from "fs";
import { RequestHandler } from "./RequestHandler";
import { DBController } from "../../database/DBController";
import { DocumentSchema } from "../../database/DocumentSchema";
import { TrainingSetSchema } from "../../database/TrainingSetSchema";

// https://www.npmjs.com/package/@tensorflow/tfjs
// https://www.youtube.com/watch?v=PO9yMqwHjdM

const LEARNING_RATE = 0.000001;

export class PredictionHandler extends RequestHandler{
    private _database:DBController;

    constructor(){
        super();

        this._database = null;
    }

    // predicts if a page is about the topic
    // (TEST - always returns true!)
    private predictPage(doc:DocumentSchema, wordIDs:{[word:string]: number}, fittedModel:tf.Model, results:any):void{
        // test data returns {xValues: [x1, x2, x3,... xn], yValues: [y1, y2, y3,... yn]}
        let {xValues, yValues} = this.extractTestData(doc.words);

        // dictionary of words in the test set that are also known to the model  
        let wordIDsInTestSet:{[word:string]: number} = {};
        xValues.forEach((word, index) => wordIDsInTestSet[wordIDs[word]] = yValues[index]);

        let testableXs:number[] = [];
        let testableYs:number[] = [];

        // each word found in test page
        for(let word in wordIDsInTestSet){
            // if the word is known to the training set
            if(word in wordIDs){
                testableXs.push(wordIDs[word]);
                testableYs.push(wordIDsInTestSet[word]);
            }
        }

        if(process.env.FILE_DEBUG === "true"){
            fs.writeFile(`./test_outputs/test_${Date.now()}.json`, JSON.stringify({testableXs, testableYs}, null, 4), err => {
                if(err) console.log(err.message);
            });
        }

        let testXs:tf.Tensor = tf.tensor2d(testableXs, [testableXs.length, 1]);
        let testYs:tf.Tensor = tf.tensor2d(testableYs, [testableYs.length, 1]);

        if(process.env.PRINT_SCORES === "true"){
            console.log('\neval y', fittedModel.evaluate(testXs, testYs).toString());
            console.log('\nprediction y', fittedModel.predict(testXs).toString());
            console.log('\ntest y', testYs.toString());
        }

        
        let score:number = parseFloat(fittedModel.evaluate(testXs, testYs)['dataSync']());
        console.log(`${doc.url} score = ${score}.`);
        results[doc.url] = isNaN(score) ? true : score >= 1;
    }

    private trainAndTest(trainingSet:TrainingSetSchema, docs:DocumentSchema[]):Promise<{[url:string]: boolean}>{
        return new Promise(resolve => {
            let {xData, yData} = this.concatTrainingData(trainingSet);

            // [word1, word2,... wordn] >> {uniqueWord1: 1, uniqueWord2: 2}
            let wordIDs:{[word: string]: number} = this.createWordIDsDict(xData);

            let trainXArray:number[] = [];
            let trainYArray:number[] = [];

            xData.forEach((word, index) => {
                // store associated x-value's word ID 
                trainXArray.push(wordIDs[word]);
                // store corresponding y-value (that word's frequency)
                trainYArray.push(yData[index]);
            });

            // get training data arrays
            let trainXs:tf.Tensor = tf.tensor2d(trainXArray, [trainXArray.length, 1]);
            let trainYs:tf.Tensor = tf.tensor2d(trainYArray, [trainYArray.length, 1]);

            if(process.env.FILE_DEBUG === "true"){
                fs.writeFile(`./test_outputs/train_${Date.now()}.json`, JSON.stringify({trainXArray, trainYArray}, null, 4), err => {
                    if(err) console.log(err.message);
                });
            }

            // results dictionary, predicted results stored here
            let results:{[url:string]: boolean} = {};

            // create a linear regression model
            let model:tf.Sequential = this.linearRegressionModel();

            // model fit & predict 
            model.fit(trainXs, trainYs).then(() => {
                // for each given page - predict
                // prediction is stored in results dictionary (key = url)
                docs.forEach(doc => this.predictPage(doc, wordIDs, model, results));

                // respond
                resolve(results);
            });
        });
    }

    private concatTrainingData(trainingSet:TrainingSetSchema):{xData:string[], yData:number[]}{
        // merge [][] to []
        let xData:string[] = [];
        let yData:number[] = [];

        trainingSet.trainX.forEach(xs => xData = xData.concat(xs));
        trainingSet.trainY.forEach(ys => yData = yData.concat(ys));

        return {xData, yData};
    }

    private createWordIDsDict(words:string[]):{[word: string]: number}{
        let wordIDs:{[word: string]: number} = {};
        let lastWordID:number = 0;

        words.forEach(word => {
            if(word in wordIDs === false){
                wordIDs[word] = ++lastWordID;
            }
        });

        return wordIDs;
    }

    // creates a linear regression model (NOT fitted)
    public linearRegressionModel():tf.Sequential{
        // linear regression model
        let model:tf.Sequential = tf.sequential();
        model.add(tf.layers.dense({units: 1, inputShape: [1]}));
        //model.add(tf.layers.dense({units: 64, inputShape: [1]}));
        //model.add(tf.layers.dense({units: 2, inputShape: [64]}));
        
        // prepare for learning - compile loss & optimizer functions 
        model.compile({loss: "meanSquaredError", optimizer: tf.train.sgd(LEARNING_RATE)});
        return model;
    }

    // converts a word dictionary to x/y arrays ({wordStr: wordFrequencyNum}) to [wordStr...], [wordFreq...]
    public extractTestData(wordDict:{[word: string]: number}):{xValues:string[], yValues:number[]}{
        let xValues:string[] = [];
        let yValues:number[] = [];

        for(let word in wordDict){
            //xValues.push(parseInt(word.split("").map(letter => letter.charCodeAt(0)).join("")));
            xValues.push(word);
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
                    this._database.findTrainingSet(topic)
                        .then(trainingSet => {
                            // load document scrape data for each doc 
                            this._database.findMany(urls.map(url => url.trim())).then(docs => {
                                // print message if not all the urls' data could be retrieved
                                // this could invalid results, prehaps handle this differently? 
                                let warnings:string = "";
                                if(docs.length < urls.length){
                                    console.log(`Prediction 'error': ${urls.length} docs, got ${docs.length}.`)
                                    warnings += `\nWarning: showing results for ${docs.length}/${urls.length} urls (scrape pages first!).\n`;
                                }

                                // train model, test model, send results 
                                if(docs.length > 0){
                                    this.trainAndTest(trainingSet, docs).then(results => {
                                        res.writeHead(200, RequestHandler.CORS_HEADERS);
                                        res.end(JSON.stringify(results, null, 4));
                                    }); 
                                }
                                else{
                                    res.writeHead(400, RequestHandler.CORS_HEADERS);
                                    res.end(`None of the ${urls.length} documents were retrieved (try scraping them).`);
                                }                  
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