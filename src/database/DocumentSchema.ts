// expected schema for items in the database
export interface DocumentSchema{
    url:string;
    algorithm_revision:number;
    words:{[word:string]: number};
}