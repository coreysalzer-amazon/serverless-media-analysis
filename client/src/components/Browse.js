import React, { Component } from 'react';
import { Auth } from 'aws-amplify';
import Loader from './Loader';
import SearchResults from './SearchResults';
import AWS from 'aws-sdk';
import axios from 'axios';

class Browse extends Component {
	constructor(props) {
	    super(props);
	    this.onSearch = this.onSearch.bind(this);
	    this.getAllFiles = this.getAllFiles.bind(this);
	}

	componentDidMount() {
		this.setState({
			allFiles: [],
			results: [],
			isLoading: true
		})
		this.getAllFiles();
	}


	getAllFiles() {
		var self = this;
		var idToken = Auth.credentials.params.Logins["cognito-idp.us-east-1.amazonaws.com/us-east-1_BIhRQnDpw"];
		axios.post('https://1rksbard2i.execute-api.us-east-1.amazonaws.com/prod/picture/search/', "", {
		    headers: {
		    	"Authorization": idToken,
		    	"search-key": Auth.credentials.identityId
		    }
		  })
		  .then(function (response) {
		    if(response.data.pictures.length != 0) {
		    	console.log(response);
		    	self.setState({
		    		allFiles: response.data.pictures, 
		    		results: response.data.pictures,
		    		isLoading: false
		    	}); 	
		    } 
		    else {
		    	self.setState({
		    		allFiles: [], 
		    		results: [],
		    		isLoading: false
		    	}); 
		    	console.log("no files found");
		    }
		  })
		  .catch(function (error) {
		    console.log(error);
		  });
	}

	onSearch(e) {
		e.preventDefault();
		var searchValue = document.getElementById("search-value").value;

		this.setState({
			allFiles: this.state.allFiles,
			results: this.state.allFiles.filter(result => searchValue === result.s3BucketUrl.substring(result.s3BucketUrl.lastIndexOf("/") + 1, result.s3BucketUrl.length)),
			isLoading: false
		});
	}


	render(){
		var results = [];
		var isLoading = false;
		if(this.state) { 
			results = this.state.results;
			isLoading = this.state.isLoading;
		};

		return(
			<div>
				<form id="search-form" onSubmit={this.onSearch} className="form-inline">
				    <div className="form-group has-feedback col-xs-offset-1 col-xs-10">
	                  <input className="form-control col-xs-12" id="search-value" placeholder="Search Files" type="text" />
	                  <span className="form-control-feedback glyphicon glyphicon-search"></span>
	                </div>
                </form>
                { isLoading && <Loader title="Loading"/> }
                <SearchResults results={results} />
			</div>
		);
	}
	
}

export default Browse;