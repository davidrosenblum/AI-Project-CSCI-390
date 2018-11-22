import { MongoClient, Db, InsertOneWriteOpResult } from "mongodb";
import { DocumentLoader } from "./DocumentLoader";

// expected schema for items in the database
export interface DocumentSchema{
    url:string;
    algorithm_revision:number;
    words:{[word:string]: number};
}

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
            console.log("Error creating collection.");
            throw err;
        });
    }

    // inserts data parsed from a web page into the database
    public insert(url:string, words:{[word:string]: number}):Promise<InsertOneWriteOpResult>{
        let algorithm_revision:number = DocumentLoader.SCRAPE_ALGORITHM_REVISION;
        return this._database.collection("documents").insertOne({url, words, algorithm_revision});
    }

    // retrieves an already loaded page from the database
    public get(url:string):Promise<DocumentSchema>{
        return new Promise((resolve, reject) => {
            this._database.collection("documents").findOne({url})
                .then(result => result ? resolve(result) : reject(`No result for ${url}`))
                .catch(err => reject(err));
        });
    }
}