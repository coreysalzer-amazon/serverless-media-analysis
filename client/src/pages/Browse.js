import React, { Component } from 'react';
import BrowseContainer from "../containers/Browse"

class Browse extends Component {
	render(){
		return <BrowseContainer { ...this.props } />
	}	
}

export default Browse;
