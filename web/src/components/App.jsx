import "../lib/bootstrap.min.css";
import "./App.css";
import React from "react";
import { Container, Card, CardBody, Row, Col, Modal, ModalBody, ModalHeader, Dropdown, DropdownItem, DropdownToggle, DropdownMenu, Navbar, NavbarToggler, Nav, Collapse, NavItem, NavLink } from "reactstrap";
import { ScrapeInput } from "./ScrapeInput";
import { TrainInput } from "./TrainInput";
import { PredictInput } from "./PredictInput";
import { CSVInput } from "./CSVInput";

export class App extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            showNav: false,
            showDropdown: false,
            dropdownOption: "all",
            showModal: false,
            modalHeader: null,
            modalBody: null
        };
    }

    toggleNav(){
        this.setState(prev => ({showNav: !prev.showNav}));
    }

    toggleDropdown(){
        this.setState(prev => ({showDropdown: !prev.showDropdown}));
    }

    toggleModal(){
        this.setState(prev => ({showModal: !prev.showModal}));
    }

    renderAll(){
        return (
            <div>
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
            </div>
        )
    }

    renderInputs(){
        if(this.state.dropdownOption === "all"){
            return this.renderAll();
        }
        else if(this.state.dropdownOption === "scrape"){
            return <ScrapeInput/>;
        }
        else if(this.state.dropdownOption === "csv"){
            return <CSVInput/>;
        }
        else if(this.state.dropdownOption === "train"){
            return <TrainInput/>;
        }
        else if(this.state.dropdownOption === "predict"){
            return <PredictInput/>;
        }
        return null;
    }

    render(){
        return (
            <div>
                <Navbar color="light" expand="md" light>
                    <NavbarToggler onClick={this.toggleNav.bind(this)}/>
                    <Collapse isOpen={this.state.showNav} navbar>
                        <Nav navbar>
                            <Dropdown isOpen={this.state.showDropdown} toggle={this.toggleDropdown.bind(this)}>
                                <DropdownToggle light caret>
                                    Display
                                </DropdownToggle>
                                <DropdownMenu>
                                    <DropdownItem onClick={() => this.setState({dropdownOption: "all"})}>Show All</DropdownItem>
                                    <DropdownItem onClick={() => this.setState({dropdownOption: "scrape"})}>Scrape Pages</DropdownItem>
                                    <DropdownItem onClick={() => this.setState({dropdownOption: "csv"})}>Download CSV</DropdownItem>
                                    <DropdownItem onClick={() => this.setState({dropdownOption: "train"})}>Training Data</DropdownItem>
                                    <DropdownItem onClick={() => this.setState({dropdownOption: "predict"})}>Predict</DropdownItem>
                                </DropdownMenu>
                            </Dropdown>
                        </Nav>
                    </Collapse>
                </Navbar>
                <br/>
                <Container>
                    <Card color="light">
                        <CardBody>
                            {this.renderInputs()}
                        </CardBody>
                    </Card>
                </Container>
                <Modal isOpen={this.state.isOpen} toggle={this.toggleModal.bind(this)}>
                    <ModalHeader>
                        {this.state.modalHeader}
                    </ModalHeader>
                    <ModalBody>
                        {this.state.modalBody}
                    </ModalBody>
                </Modal>
            </div>
        );
    }
}