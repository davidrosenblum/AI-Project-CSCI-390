import "../lib/bootstrap.min.css";
import React from "react";
import { Input } from "./Input";

export class App extends React.Component{
    render(){
        return (
            <div className="container card card-body bg-light">
                <Input/>
            </div>
        );
    }
}