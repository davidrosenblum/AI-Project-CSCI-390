import * as http from "http";
import * as https from "https";
import * as cheerio from "cheerio";

// Utility class for loading and parsing web pages
export class DocumentLoader{
    // creates a dictionary of all unique words to their word count {word: count}
    private static parse(text:string):{[word:string]: number}{
        let dict:{[word:string]: number} = {};

        // regex removes '.' and converts line breaks to spaces
        text.replace(/\n/gi, " ").replace(/\./gi, "").split(" ").forEach(word => {
            if(word in dict){
                // not first encounter, increment frequency
                dict[word]++;
            }
            else{
                // first encounter
                dict[word] = 1;     
            }
        });

        return dict;
    }

    // loads a page via https and creates a dictionary of unique word : counts
    public static seek(url:string):Promise<{[word:string]: number}>{
        return new Promise((resolve, reject) => {
            // https request...
            let req:http.ClientRequest = https.get(url, res => {
                let data:string = "";

                res.on("data", chunk => data += chunk);

                res.on("end", () => {
                    // https success, parse the data
                    let $:CheerioStatic = cheerio.load(data);

                    let body:string = $("body").text();

                    let words:{[word:string]: number} = DocumentLoader.parse(body);

                    resolve(words);
                });
            });

            req.on("error", err => reject(err));
        });
    }
}