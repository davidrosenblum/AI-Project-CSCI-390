import { MongoClient, Db, InsertOneWriteOpResult } from "mongodb";
import { DocumentLoader } from "../core/DocumentLoader";
import { DocumentSchema } from "./DocumentSchema";
import { TrainingDataSchema } from "./TrainingDataSchema";



// class manages a database connection (provides the 'queries')
export class DBController{
    private _database:Db;

    constructor(client:MongoClient, dbName:string){
        this._database = client.db(dbName);

        this.createCollections(); // setup
    }

    // creates collection (table) if not exists
    private createCollections():void{
        this._database.createCollection("documents").catch(err => {
            console.log("Error creating documents collection.");
            throw err;
        }).then(() => this._database.collection("documents").createIndex({url: 1})).catch(err => {});

        this._database.createCollection("training").catch(err => {
            console.log("Error creating training collection");
            throw err;
        }).then(() => this._database.collection("training").createIndex({topic: 1}).catch(err => {}));
    }

    public insertTrainingData(model:TrainingDataSchema):Promise<InsertOneWriteOpResult>{
        return this._database.collection("training").insertOne(model);
    }

    public findTrainingData(topic:string):Promise<TrainingDataSchema>{
        return new Promise((resolve, reject) => {
            this._database.collection("training").findOne({topic})
                .then(result => result ? resolve(result) : reject(new Error(`No result for ${topic}`)))
                .catch(err => reject(err));
        });
    }

    // inserts data parsed from a web page into the database
    public insert(url:string, words:{[word:string]: number}):Promise<InsertOneWriteOpResult>{
        let algorithm_revision:number = DocumentLoader.SCRAPE_ALGORITHM_REVISION;
        return this._database.collection("documents").insertOne({url, words, algorithm_revision});
    }

    // retrieves an already loaded page from the database
    public find(url:string):Promise<DocumentSchema>{
        return new Promise((resolve, reject) => {
            this._database.collection("documents").findOne({url})
                .then(result => result ? resolve(result) : reject(new Error(`No result for ${url}`)))
                .catch(err => reject(err));
        });
    }

    public findMany(urls:string[]):Promise<DocumentSchema[]>{
        return new Promise(resolve => {
            let numDone:number = 0;
            let results:DocumentSchema[] = [];

            urls.forEach(url => {
                this.find(url)
                    .then(doc => results.push(doc))
                    .catch(err => {})
                    .then(() => {
                        if(++numDone === urls.length){
                            resolve(results);
                        }
                    });
            }); 
        });
    }
}