import React from "react";
import { Form, FormGroup, Button, Input, Label } from "reactstrap";
import { ajax } from "../ajax";
import ModalDispatcher from "../dispatchers/ModalDispatcher";

export class CSVInput extends React.Component{
    constructor(props){
        super(props);

        this.urlsInput = null;
        this.filenameInput = null;

        this.state = {
            message: null,
            pending: false
        };
    }

    onSubmit(evt){
        evt.preventDefault();

        let urls = encodeURIComponent(this.urlsInput.value);

        let origin = window.location.origin.includes("localhost") ? "http://localhost:8080" : window.location.origin;

        let headers = {
            "Access-Control-Allow-Origin": window.location.origin
        };

        let config = {
            method:     "GET",
            url:        `${origin}/api/page/csv?urls=${urls}`,
            headers
        };

        this.setState({pending: true, message: "Requesting CSV file..."});

        ajax(config)
            .then(xhr => {
                if(xhr.status === 200){
                    // get optional filename or use default 
                    let filename = this.filenameInput.value ? this.filenameInput.value : `words_${Date.now()}.csv`;

                    // append .csv if needed
                    if(!filename.endsWith(".csv")){
                        filename += ".csv";
                    }

                    // create a secret link tag
                    let csvBlob = new Blob([xhr.response], {type: "octet/stream"});
                    let a = document.createElement("a");
                    let objUrl = window.URL.createObjectURL(csvBlob);

                    // setup tag and download
                    a.setAttribute("download", filename);
                    a.setAttribute("href", objUrl);
                    a.click();

                    // delete data url & free buttons
                    window.URL.revokeObjectURL(objUrl);
                    this.setState({pending: false, message: ""});
                }
                else{
                    ModalDispatcher.emit("show-modal", {header: "Scrape Results", body: xhr.response});
                }
                
            })
            .catch(err => ModalDispatcher.emit("show-modal", {header: "CSV Results", body: "Server not available."}))
            .then(() => this.setState({pending: false, message: ""}));
    }

    onClear(){
        this.urlsInput.value = "";
        
        this.setState({message: null});
    }

    render(){
        return (
            <div>
                <Form onSubmit={this.onSubmit.bind(this)}>
                    <h3 className="text-center">Download CSV</h3>
                    <FormGroup>
                        <Label>URLs</Label>
                        <Input
                            innerRef={input => this.urlsInput = input}
                            placeholder="Enter URL(s) for their combined CSV data"
                            type="text"
                            required
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label>Optional Filename</Label>
                        <Input
                            innerRef={input => this.filenameInput = input}
                            placeholder="Enter optional filename (.csv not neccessary)"
                            type="text"
                        />
                    </FormGroup>
                    <FormGroup className="text-center">
                        <Button disabled={this.state.pending}>
                            Submit
                        </Button>&nbsp;
                        <Button onClick={this.onClear.bind(this)} disabled={this.state.pending} type="button">
                            Clear
                        </Button>
                    </FormGroup>
                </Form>
                <div className="text-center">
                    {this.state.message}
                </div>
                <div>
                    URL(s) placed here will be searched for in the database.
                    A CSV file will be downloaded with all the data about the URL(s).
                </div>
            </div>
        );
    }
}