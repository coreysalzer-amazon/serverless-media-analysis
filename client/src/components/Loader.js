import React, { Component } from 'react';
import "../styles/loader.css";

class Loader extends Component {

	constructor(props) {
		super(props);
		this.title = props.title;
	}

	render() {
		return(
			<div id="loader-container" className="container-fluid col-xs-11">
    			<div className="col-xs-12">
    				<div className="loader"></div>
    			</div>
    			<strong id="status" className="title col-xs-12">{ this.props.title }</strong>
    		</div>
		);
	}

}

export default Loader;