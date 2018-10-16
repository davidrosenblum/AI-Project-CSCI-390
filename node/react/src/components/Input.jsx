import React from "react";
import { ajax } from "../ajax";

export class Input extends React.Component{
    constructor(props){
        super(props);

        this.urlRef = React.createRef();

        this.state = {
            pending: false,
            message: null
        };
    }

    onSubmit(evt){
        evt.preventDefault();

        let url = this.urlRef.current.value;

        let origin = window.location.origin.includes("localhost") ? "http://localhost:8080" : window.location.origin;

        let config = {
            method:     "POST",
            url:        `${origin}/api/page/load`,
            headers:    {"x-api-key": "darksoulsIII", "Access-Control-Allow-Headers": "x-api-key"},
            data:       {url}

        };

        this.setState({pending: true, message: "Processing..."});

        ajax(config)
            .then(xhr => {
                this.setState({pending: false, message: "Success"});
            })
            .catch(err => {
                this.setState({pending: false, message: "Error"});
            });
    }

    onClear(){
        this.urlRef.current.value = "";
    }

    render(){
        return (
            <div>
                <form onSubmit={this.onSubmit.bind(this)}>
                    <div className="form-group">
                        <input ref={this.urlRef} className="form-control" type="text" placeholder="Enter URL here" required/>
                    </div>
                    <div className="form-group text-center">
                        <input className="input-btn" disabled={this.state.pending} type="submit"/>&nbsp;
                        <button onClick={this.onClear.bind(this)} className="input-btn" disabled={this.state.pending} type="button">Clear</button>
                    </div>
                </form>
                <div className="text-center">
                    {this.state.message}
                </div>
            </div>
        );
    }
}