import React, { Component } from 'react';
import SearchLabelsContainer from "../containers/SearchLabels"

class SearchLabels extends Component {
	render(){
		return <SearchLabelsContainer { ...this.props } />
	}	
}

export default SearchLabels;
