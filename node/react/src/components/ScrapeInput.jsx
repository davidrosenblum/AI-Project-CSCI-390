import React from "react";
import { ajax } from "../ajax";

export class ScrapeInput extends React.Component{
    constructor(props){
        super(props);

        this.urlsRef = React.createRef();

        this.state = {
            pending: false,
            message: null
        };
    }

    onSubmit(evt){
        evt.preventDefault();

        let urls = this.urlsRef.current.value.split(",");

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
        this.urlsRef.current.value = "";
    }

    render(){
        return (
            <div>
                <form onSubmit={this.onSubmit.bind(this)}>
                    <h3 className="text-center">Scrape Pages</h3>
                    <div className="form-group">
                        <input ref={this.urlsRef} className="form-control" type="text" placeholder="Enter URL(s) separated by commas here" required/>
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
                    URL(s) placed here will be scrapped and stored in the database for quick future use.
                    This data is not associated with any model, but can be used in model creation later.
                </div>
            </div>
        );
    }
}