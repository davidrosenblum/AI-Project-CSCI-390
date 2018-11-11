import "../lib/bootstrap.min.css";
import "./App.css";
import React from "react";
import { Container, Card, CardBody, Row, Col} from "reactstrap";
import { ScrapeInput } from "./ScrapeInput";
import { TrainInput } from "./TrainInput";
import { PredictInput } from "./PredictInput";
import { CSVInput } from "./CSVInput";

export class App extends React.Component{
    render(){
        return (
            <div>
                <br/>
                <Container>
                    <Card color="light">
                        <CardBody>
                            <Row>
                                <Col lg={6}>
                                    <ScrapeInput/>
                                </Col>
                                <Col lg={6}>
                                    <CSVInput/>
                                </Col>
                            </Row>
                            <br/>
                            <Row>
                                <Col lg={6}>
                                    <TrainInput/>
                                </Col>
                                <Col lg={6}>
                                    <PredictInput/>
                                </Col>
                            </Row>
                        </CardBody>
                    </Card>
                </Container>
            </div>
        );
    }
}