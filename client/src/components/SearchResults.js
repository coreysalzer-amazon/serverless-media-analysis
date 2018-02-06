import React, { Component } from 'react';
import ResultsRow from './ResultsRow';


class SearchResults extends Component {
    render() {
    	// number of results in each row to render in each ResultsRow
    	var numColsInRow = 3;
    	var counter = 0;
    	var resultsList = [];
    	while(counter < this.props.results.length) {
    		resultsList.push(<ResultsRow key={counter} results={this.props.results.slice(counter, Math.min(this.props.results.length, counter+numColsInRow))} />);
    		counter += numColsInRow;
    	}
        if(resultsList.length == 0) {
        	resultsList = <div className="result col-md-4 col-xs-12"></div>;
        }
        return(<div className="results container-fluid">{resultsList}</div>);
    }
}

export default SearchResults;