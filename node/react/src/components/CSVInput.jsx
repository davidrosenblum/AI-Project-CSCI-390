import React from "react";
import { ajax } from "../ajax";

export class CSVInput extends React.Component{
    constructor(props){
        super(props);

        this.urlsRef = React.createRef();

        this.state = {
            message: null,
            pending: false
        };
    }

    onSubmit(evt){
        evt.preventDefault();

        let urls = encodeURIComponent(this.urlsRef.current.value);

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
                let message = xhr.status === 200 ? null : xhr.response;
                this.setState({pending: false, message});
            })
            .catch(err => {
                this.setState({pending: false, message: "Request error."});
            });
    }

    onClear(){
        this.urlsRef.current.value = "";
    }

    render(){
        return (
            <div>
                <form onSubmit={this.onSubmit.bind(this)}>
                    <h3 className="text-center">Download CSV</h3>
                    <div className="form-group">
                        <input
                            ref={this.urlsRef}
                            className="form-control"
                            placeholder="Enter URL(s) for their combined CSV data"
                            type="text"
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
                    URL(s) placed here will be searched for in the database.
                    A CSV file will be downloaded with all the data about the URL(s).
                </div>
            </div>
        );
    }
}