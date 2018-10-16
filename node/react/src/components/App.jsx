import "../lib/bootstrap.min.css";
import "./App.css";
import React from "react";
import { Input } from "./Input";

export class App extends React.Component{
    render(){
        return (
            <div>
                <br/>
                <div className="container card card-body bg-light">
                    <Input/>
                </div>
            </div>
        );
    }
}