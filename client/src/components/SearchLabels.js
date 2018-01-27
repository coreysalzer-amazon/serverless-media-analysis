import React, { Component } from 'react';
import { Auth, Storage } from 'aws-amplify';
import axios from 'axios';
import $ from 'jquery';
import '../styles/searchLabels.css';

var SearchResults = React.createClass({
    render: function() {
		var resultsList = this.props.results.map(function(result) {
            var fileName = result.s3BucketUrl.substring(result.s3BucketUrl.lastIndexOf("/") + 1, result.s3BucketUrl.length);
    		Storage.get(fileName, { "track": "private" })
		        .then (function(response) {
		        	console.log(response);
		        	var file = response;
		        	var uniqueLabels = [];
					$.each(result.labels, function(i, el){
					    if($.inArray(el, uniqueLabels) === -1) uniqueLabels.push(el);
					});

		            return(
		            	<div className="results" key={result.id}>
		            		<img src= { file }></img>
		            		<strong className="result-name">{fileName}</strong>
		        		</div>
		        	);
		        })
        		.catch(err => console.log(err));

    		
        });
        if(resultsList.length == 0) {
        	resultsList = <div className="results"></div>;
        }
        return <div>{resultsList}</div>;
    }
});


class SearchLabels extends Component {
	constructor(props) {
	    super(props);
	    this.onSearch = this.onSearch.bind(this);
	}

	componentDidMount() {
		this.setState({results:[]})
	}

	onSearch(e) {
		var self = this;
		e.preventDefault();
      	var searchValue = document.getElementById("search-value").value;
		var idToken = Auth.credentials.params.Logins["cognito-idp.us-east-1.amazonaws.com/us-east-1_BIhRQnDpw"];
		axios.post('https://1rksbard2i.execute-api.us-east-1.amazonaws.com/prod/picture/search/', "", {
		    headers: {
		    	"Authorization": idToken,
		    	"search-key": searchValue
		    }
		  })
		  .then(function (response) {
		    if(response.data.pictures.length != 0) {
		    	console.log(response);
		    	self.setState({results:response.data.pictures}); 	
		    } 
		    else {
		    	//no pictures with Label
		    }
		  })
		  .catch(function (error) {
		    console.log(error);
		  });

	}

	render(){
		var results = [];
		if(this.state) { results = this.state.results };

		return(
			<div>
				<form id="search-form" onSubmit={this.onSearch} className="form-inline">
				    <div className="form-group has-feedback col-xs-offset-1 col-xs-10">
	                  <input className="form-control col-xs-12" id="search-value" placeholder="Search Labels" type="text" />
	                  <span className="form-control-feedback glyphicon glyphicon-search"></span>
	                </div>
                </form>
                <SearchResults results={results} />
			</div>
		);
	}
}

export default SearchLabels;