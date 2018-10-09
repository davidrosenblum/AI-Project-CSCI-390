export const ajax = function(options){
    if(!options || typeof options !== "object")
        throw new Error("Ajax options missing.");

    return new Promise((resolve, reject) => {
        let method = (typeof options.method === "string") ? options.method : "GET",
            url = (typeof options.url === "string") ? options.url : window.location.origin,
            headers = (typeof options.headers === "object" && options.headers) ? options.headers : {},
            data = options.data;

        let xhr = new XMLHttpRequest();

        xhr.onload = () => resolve(xhr);
        xhr.onerror = err => reject(err);

        xhr.open(method, url, true);

        for(let h in headers){
            xhr.setRequestHeader(h, headers[h]);
        }

        if(data){
            if(typeof data !== "string"){
                let out = null;

                try{
                    out = JSON.stringify(data);
                }
                catch(err){
                    reject(err);
                }

                xhr.send(out);
            }
            else xhr.send(data);
        }
        else xhr.send();
    });
};