import React, { Component } from 'react';
import { Auth } from 'aws-amplify';
import axios from 'axios';
import $ from 'jquery';
import '../styles/searchLabels.css';
import preview from '../img/preview.jpg';
import Loader from './Loader';
import MediaResult from './MediaResult';


class ResultsRow extends Component {
	render() {
		var isLoading = this.props.isLoading;

		var resultsRowList = this.props.results.map(function(result) {
            var fileName = result.s3BucketUrl.substring(result.s3BucketUrl.lastIndexOf("/") + 1, result.s3BucketUrl.length);
		   	//      	var uniqueLabels = [];
			// $.each(result.labels, function(i, el){
			//     if($.inArray(el, uniqueLabels) === -1) uniqueLabels.push(el);
			// });

    		return(
            	<div className="result col-md-4 col-xs-12" key={result.id}>
        			<MediaResult fileName={ fileName } />
        		</div>
        	);		
        });
        if(resultsRowList.length == 0) {
        	resultsRowList = <div className="result col-md-4 col-xs-12"></div>;
        }
        return(<div className="row row-eq-height">{resultsRowList}</div>);
	}
}

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


class SearchLabels extends Component {
	constructor(props) {
	    super(props);
	    this.onSearch = this.onSearch.bind(this);
	}

	componentDidMount() {
		this.setState({
			results:[],
			isLoading:false
		});
	}

	onSearch(e) {
		var self = this;
		e.preventDefault();
		self.setState({
			results: [],
			isLoading: true
		})

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
		    	self.setState({
		    		results: response.data.pictures, 
		    		isLoading: false
		    	}); 	
		    } 
		    else {
		    	self.setState({
		    		results: [], 
		    		isLoading: false
		    	}); 
		    	console.log("no pictures found");
		    }
		  })
		  .catch(function (error) {
		    console.log(error);
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
	                  <input className="form-control col-xs-12" id="search-value" placeholder="Search Labels" type="text" />
	                  <span className="form-control-feedback glyphicon glyphicon-search"></span>
	                </div>
                </form>
                { isLoading && <Loader title="Loading"/> }
                <SearchResults results={results} />
			</div>
		);
	}
}

export default SearchLabels;