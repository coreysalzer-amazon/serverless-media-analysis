import React, { Component } from 'react';
import { Auth } from 'aws-amplify';
import Loader from './Loader';
import SearchResults from './SearchResults';
import AWS from 'aws-sdk';
import axios from 'axios';
import Select from 'react-select';
import 'react-select/dist/react-select.css';
import { getFileNameFromURL } from "../utils/utils";
import $ from 'jquery';
import '../utils/jquery.autocomplete';
import '../styles/jquery.autocomplete.css';



class Browse extends Component {
	constructor(props) {
	    super(props);
	    this.onSearch = this.onSearch.bind(this);
	    this.getAllFiles = this.getAllFiles.bind(this);
	}

	componentDidMount() {
		this.setState({
			selectedOption: '',
			allFiles: [],
			results: [],
			isLoading: true
		})
		this.getAllFiles();
	}


	componentWillUnmount() {
		$("#search-value").autocomplete('destroy');
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

		    	var autoCompleteAllFiles = [];
		    	self.state.allFiles.forEach(function(result) {
					autoCompleteAllFiles.push(getFileNameFromURL(result.s3BucketUrl));
				})
		    	$("#search-value").autocomplete({source: [autoCompleteAllFiles]}); 	
		    	$("#search-value").keypress(self.onSearch);
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
		if(e.keyCode === 13) {
			e.preventDefault();
			var searchValue = document.getElementById("search-value").value;

			this.setState({
				allFiles: this.state.allFiles,
				results: this.state.allFiles.filter(result => searchValue === getFileNameFromURL(result.s3BucketUrl)),
				isLoading: false
			});
		}
	}

	render(){
		var results = [];
		var autoCompleteAllFiles = [];
		var isLoading = false;
		var value = "";
		if(this.state) { 

			this.state.allFiles.forEach(function(result) {
				autoCompleteAllFiles.push({ value: getFileNameFromURL(result.s3BucketUrl), label: getFileNameFromURL(result.s3BucketUrl)})
			})

			results = this.state.results;
			isLoading = this.state.isLoading;
		};


		return(
			<div>
				<form id="search-form" onSubmit={this.onSearch} className="form-inline">
				    <div className="ui-widget form-group has-feedback col-xs-offset-1 col-xs-10">
	                  <input onChange={this.onSearch} className="form-control col-xs-12" id="search-value" placeholder="Search Files" type="text"/>
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