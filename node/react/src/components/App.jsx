import "../lib/bootstrap.min.css";
import "./App.css";
import React from "react";
import { ScrapeInput } from "./ScrapeInput";
import { TrainInput } from "./TrainInput";
import { PredictInput } from "./PredictInput";
import { CSVInput } from "./CSVInput";

export class App extends React.Component{
    render(){
        return (
            <div>
                <br/>
                <div className="container card card-body bg-light">
                    <div className="row">
                        <div className="col-lg-6">
                            <ScrapeInput/>
                        </div>
                        <div className="col-lg-6">
                            <CSVInput/>
                        </div>
                    </div>
                    <br/>
                    <div className="row">
                        <div className="col-lg-6">
                            <TrainInput/>
                        </div>
                        <div className="col-lg-6">
                            <PredictInput/>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}