import React from "react";
import { Form, FormGroup, Button, Input } from "reactstrap";
import { ajax } from "../ajax";

export class ScrapeInput extends React.Component{
    constructor(props){
        super(props);

        this.urlsInput = null;

        this.state = {
            pending: false,
            message: null
        };
    }

    onSubmit(evt){
        evt.preventDefault();

        let urls = this.urlsInput.value.split(",");

        let origin = window.location.origin.includes("localhost") ? "http://localhost:8080" : window.location.origin;

        let headers = {
            "Access-Control-Allow-Origin": window.location.origin
        };

        let config = {
            method:     "POST",
            url:        `${origin}/api/page/scrape`,
            data:       {urls},
            headers
        };

        this.setState({pending: true, message: "Requesting scrape..."});

        ajax(config)
            .then(xhr => {
                this.setState({pending: false, message: xhr.response});
            })
            .catch(err => {
                this.setState({pending: false, message: "Request Error"});
            });
    }

    onClear(){
        this.urlsInput.value = "";

        this.setState({message: null});
    }

    render(){
        return (
            <div>
                <Form onSubmit={this.onSubmit.bind(this)}>
                    <h3 className="text-center">Scrape Pages</h3>
                    <FormGroup>
                        <Input
                            innerRef={input => this.urlsInput = input}
                            type="text"
                            placeholder="Enter URL(s) separated by commas here"
                            required
                        />
                    </FormGroup>
                    <FormGroup className="text-center">
                        <Button disabled={this.state.pending}>Submit</Button>&nbsp;
                        <Button onClick={this.onClear.bind(this)} disabled={this.state.pending} type="button">
                            Clear
                        </Button>
                    </FormGroup>
                </Form>
                <div className="text-center">
                    {this.state.message}
                </div>
                <div>
                    URL(s) placed here will be scrapped and stored in the database for quick future use.
                    This data is not associated with any model, but can be used in model creation later.
                </div>
            </div>
        );
    }
}