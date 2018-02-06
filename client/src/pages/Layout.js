import React, { Component } from 'react';
import LayoutContainer from '../containers/Layout';
import { Auth } from 'aws-amplify';

export default class Layout extends Component {
	componentWillMount() {
		console.log("will render");
	}

	render(){
		console.log(this.props);
		if (this.props.authState !== 'signedIn') { return null; }

		return(
			<LayoutContainer { ...this.props } > 
				{ this.props.children }
			</LayoutContainer>
		);
	}	
}