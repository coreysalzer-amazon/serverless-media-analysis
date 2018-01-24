import React, { Component } from 'react';
import '../styles/searchLabels.css'


class SearchLabels extends Component {
	render(){
		return(
			<div>
				<form className="form-inline">
				    <div className="form-group has-feedback col-xs-offset-1 col-xs-10">
	                  <input className="form-control col-xs-12" id="search-value" placeholder="Search Labels" type="text" />
	                  <span className="form-control-feedback glyphicon glyphicon-search"></span>
	                </div>
                </form>
			</div>
		);
	}
}

export default SearchLabels;