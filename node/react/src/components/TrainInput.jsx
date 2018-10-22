import React from "react";
import { ajax } from "../ajax";

export class TrainInput extends React.Component{
    constructor(props){
        super(props);

        this.urlsRef = React.createRef();
        this.topicRef = React.createRef();

        this.state = {
            message: null,
            pending: false
        };
    }

    onSubmit(evt){
        evt.preventDefault();

        let urls = this.urlsRef.current.value.split(",");
        let topic = this.topicRef.current.value;

        let origin = window.location.origin.includes("localhost") ? "http://localhost:8080" : window.location.origin;

        let headers = {
            "Access-Control-Allow-Origin": window.location.origin,
        };

        let config = {
            method:     "POST",
            url:        `${origin}/api/train/${topic}`,
            data:       {urls, topic},
            headers
        };

        ajax(config)
            .then(xhr => {
                this.setState({pending: false, message: xhr.response});
            })
            .catch(err => {
                this.setState({pending: false, message: "Error"});
            });
    }

    onClear(){
        this.inputRef.current.value = "";
        this.topicRef.current.value = "";
    }

    render(){
        return (
            <div>
                <form onSubmit={this.onSubmit.bind(this)}>
                    <h3 className="text-center">Training Data</h3>
                    <div className="form-group">
                        <input
                            ref={this.urlsRef}
                            className="form-control"
                            type="text"
                            placeholder="Enter training URL(s) here, comma separated"
                            required
                        />
                    </div>
                    <div className="form-group">
                    <input
                            ref={this.topicRef}
                            className="form-control"
                            type="text"
                            placeholder="Enter training topic"
                            required
                        />
                    </div>
                    <div className="form-group text-center">
                        <input className="input-btn" disabled={this.state.pending} type="submit"/>&nbsp;
                        <button onClick={this.onClear.bind(this)} className="input-btn" disabled={this.state.pending} type="button">
                            Clear
                        </button>
                    </div>
                </form>
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