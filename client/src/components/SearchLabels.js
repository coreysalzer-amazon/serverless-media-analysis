import React, { Component } from 'react';
import { Auth, Storage } from 'aws-amplify';
import axios from 'axios';
import $ from 'jquery';
import '../styles/searchLabels.css';
import preview from '../img/preview.jpg';

class ImageResult extends Component {
	constructor(props) {
		super(props);

		if (this.props.fileName) {
			var self = this;
			Storage.get(this.props.fileName, { level: "private" })
		        .then (function(response) {
		        	console.log(response);
		        	var file = response;
		            self.setState({file: file});
		        })
	    		.catch(function(err){
	    			console.log(err);
	    			self.setState({file: preview});
	    		});
		}
	}

	componentWillMount() {
		this.setState({file:preview});
	}

	render() {
		var file = preview;
  		if(this.state) { file = this.state.file; }

  		if(file.includes(".mov") || file.includes(".mp4")) {
  			return(<video autoPlay src= { file } alt={ preview }></video>);
  		}

        return(<img src= { file }></img>);

	}
}

class SearchResults extends Component {
    render() {
		var resultsList = this.props.results.map(function(result) {
            var fileName = result.s3BucketUrl.substring(result.s3BucketUrl.lastIndexOf("/") + 1, result.s3BucketUrl.length);
		   	//      	var uniqueLabels = [];
			// $.each(result.labels, function(i, el){
			//     if($.inArray(el, uniqueLabels) === -1) uniqueLabels.push(el);
			// });

    		return(
            	<div className="result col-md-4 col-xs-12" key={result.id}>
        			<ImageResult fileName={ fileName } />
        			<strong className="result-name">{ fileName }</strong>
        		</div>
        	);		
        });
        if(resultsList.length == 0) {
        	resultsList = <div className="result col-md-4 col-xs-12"></div>;
        }
        return(<div className="results">{resultsList}</div>);
    }
}


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