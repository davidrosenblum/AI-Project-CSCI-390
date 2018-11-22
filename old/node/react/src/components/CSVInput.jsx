import React from "react";
import { Form, FormGroup, Button, Input } from "reactstrap";
import { ajax } from "../ajax";

export class CSVInput extends React.Component{
    constructor(props){
        super(props);

        this.urlsInput = null;

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
                    this.setState({pending: false, message: ""});

                    // create a secret link tag
                    let csvBlob = new Blob([xhr.response], {type: "octet/stream"});
                    let a = document.createElement("a");
                    let objUrl = window.URL.createObjectURL(csvBlob);

                    // setup tag and download
                    a.setAttribute("download", "words.csv");
                    a.setAttribute("href", objUrl);
                    a.click();

                    window.URL.revokeObjectURL(objUrl);
                }
                else{
                    this.setState({pending: false, message: xhr.response});
                }
                
            })
            .catch(err => {
                this.setState({pending: false, message: "Request error."});
            });
    }

    onClear(){
        this.urlsInput.value = "";
    }

    render(){
        return (
            <div>
                <Form onSubmit={this.onSubmit.bind(this)}>
                    <h3 className="text-center">Download CSV</h3>
                    <FormGroup>
                        <Input
                            innerRef={input => this.urlsInput = input}
                            placeholder="Enter URL(s) for their combined CSV data"
                            type="text"
                            required
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