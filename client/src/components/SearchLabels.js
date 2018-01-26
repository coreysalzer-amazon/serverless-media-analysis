import React, { Component } from 'react';
import { Auth } from 'aws-amplify';
import axios from 'axios';
import '../styles/searchLabels.css'


class SearchLabels extends Component {
	constructor(props) {
	    super(props);
	    this.onSearch = this.onSearch.bind(this);
	}

	onSearch(e) {
		if (e.key === 'Enter') {
	      	var searchValue = e.target.value;
			var idToken = Auth.credentials.params.Logins["cognito-idp.us-east-1.amazonaws.com/us-east-1_BIhRQnDpw"];
			axios.post('https://1rksbard2i.execute-api.us-east-1.amazonaws.com/prod/picture/search/', "", {
			    headers: {
			    	"Authorization": idToken,
			    	"search-key": searchValue
			    }
			  })
			  .then(function (response) {
			    if(true /*has labels*/) {
			    	console.log(response);
			    } 
			    else {
			    	
			    }
			  })
			  .catch(function (error) {
			    console.log(error);
			  });
	    }

	}

	render(){
		return(
			<div>
				<form className="form-inline">
				    <div className="form-group has-feedback col-xs-offset-1 col-xs-10">
	                  <input className="form-control col-xs-12" id="search-value" placeholder="Search Labels" onKeyPress={this.onSearch} type="text" />
	                  <span className="form-control-feedback glyphicon glyphicon-search"></span>
	                </div>
                </form>
			</div>
		);
	}
}

export default SearchLabels;