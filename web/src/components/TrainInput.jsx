import React from "react";
import { Form, FormGroup, Button, Input, Label } from "reactstrap";
import { ajax } from "../ajax";
import ModalDispatcher from "../dispatchers/ModalDispatcher";

export class TrainInput extends React.Component{
    constructor(props){
        super(props);

        this.urlsInput = null;
        this.topicInput = null;

        this.state = {
            message: null,
            pending: false
        };
    }

    onSubmit(evt){
        evt.preventDefault();

        let urls = this.urlsInput.value.split(",");
        let topic = this.topicInput.value;

        let origin = window.location.origin.includes("localhost") ? "http://localhost:8080" : window.location.origin;

        let headers = {
            "Access-Control-Allow-Origin": window.location.origin,
        };

        let config = {
            method:     "POST",
            url:        `${origin}/api/train`,
            data:       {urls, topic},
            headers
        };

        ajax(config)
            .then(xhr => ModalDispatcher.emit("show-modal", {header: "Training Results", body: xhr.response}))
            .catch(err => ModalDispatcher.emit("show-modal", {header: "Training Results", body: "Server not available."}))
            .then(() => this.setState({pending: false, message: ""}));
    }

    onClear(){
        this.urlsInput.value = "";
        this.topicInput.value = "";

        this.setState({message: null});
    }

    render(){
        return (
            <div>
                <Form onSubmit={this.onSubmit.bind(this)}>
                    <h3 className="text-center">Training Data</h3>
                    <FormGroup>
                        <Label>URLs</Label>
                        <Input
                            innerRef={input => this.urlsInput = input}
                            type="text"
                            placeholder="Enter training URL(s) here, comma separated"
                            required
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label>Topic</Label>
                        <Input
                            innerRef={input => this.topicInput = input}
                            type="text"
                            placeholder="Enter training topic"
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
                    URL(s) placed here will be loaded and used to create a training model.
                </div>
            </div>
        );
    }
}