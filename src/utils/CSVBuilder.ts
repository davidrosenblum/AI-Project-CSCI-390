import { DocumentSchema } from '../database/DocumentSchema';

export class CSVBuilder{
    // figures out the word frequency of a corpus 
    public static aggregateWordDictionary(docs:DocumentSchema[]):{[word:string]: number}{
        let aggregateWords:{[word:string]: number} = {};

        docs.forEach(doc => {
            for(let word in doc.words){
                if(word in aggregateWords){
                    aggregateWords[word]++;
                }
                else{
                    aggregateWords[word] = 1;
                }
            }
        });

        return aggregateWords;
    }

    // json to csv for multiple web pages
    public static makeMergedCSV(docs:DocumentSchema[]):string{
        let aggregateWords:{[word:string]: number} = CSVBuilder.aggregateWordDictionary(docs);

        // make a fake document of the combined results
        let combinedDoc:DocumentSchema = {
            url: null,
            words: aggregateWords,  // only important attribute
            algorithm_revision: 0
        };

        return CSVBuilder.makeCSV(combinedDoc);
    }

    // system uses json, but this method converts json (of this schema) to csv for a single page
    public static makeCSV(doc:DocumentSchema):string{
        let words:string[] = [],
            counts:number[] = [];

        for(let word in doc.words){
            words.push(word);
            counts.push(doc.words[word]);
        }

        return words.join(",") + "\n" + counts.join(",");
    }
}