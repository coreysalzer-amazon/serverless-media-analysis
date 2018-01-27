import React, { Component } from 'react';
import { S3Image } from 'aws-amplify-react';
import { Storage, Auth } from 'aws-amplify';
import "../styles/upload.css";
import preview from '../img/preview.jpg';
import axios from 'axios';
import $ from 'jquery';

var LabelsList = React.createClass({
    render: function() {
		var uniqueLabels = [];
		$.each(this.props.labels, function(i, el){
		    if($.inArray(el, uniqueLabels) === -1) uniqueLabels.push(el);
		});

		var listComponents = uniqueLabels.map(function(label) {
            return(
            	<div className="labels" key={label}>
            		<i className="label-name">{label}</i>
        		</div>
        	);
        });
        if(listComponents.length == 0) {
        	listComponents = <div className="labels"></div>;
        }
        return <div>{listComponents}</div>;
    }
});

class Upload extends Component {
  constructor(props) {
    super(props);
    Storage.configure({ level: 'private', track: true });
    this.onChange = this.onChange.bind(this);
    this.onFormSubmit = this.onFormSubmit.bind(this);
    this.getLabels = this.getLabels.bind(this);
  }

  componentDidMount() {
  	this.setState({labels:[]});
  }

  onChange(e) {
  	this.setState({file:e.target.files[0]});
  	document.getElementById("file-input-container").className = document.getElementById("file-input-container").className + " hidden";
  	document.getElementById("upload").className = document.getElementById("upload").className.replace("hidden", "");
  	
  	if(e.target.files[0] && e.target.files[0].type.includes("image")) {
  		var reader = new FileReader();
	    reader.onload = function(){
	      var output = document.getElementById('preview');
	      output.src = reader.result;
	    };
	    reader.readAsDataURL(e.target.files[0])
  	}
  	document.getElementById("file-name").innerHTML = e.target.files[0].name;
  }

  onFormSubmit(e) {
  	e.preventDefault();
	document.getElementById("preview").style.opacity = .2;
	document.getElementById("loader-container").className = document.getElementById("loader-container").className.replace("hidden", "");

	var self = this;
    Storage.put(this.state.file.name, this.state.file)
        .then (function(result) {
        	console.log(result);
        	document.getElementById("status").innerHTML = "Analyzing";
        	self.getLabels();

        })
        .catch(err => console.log(err));

  }

  getLabels() {
  	var idToken = Auth.credentials.params.Logins["cognito-idp.us-east-1.amazonaws.com/us-east-1_BIhRQnDpw"];
  	var fileURL = 'rekognition-20180119151350.rekognition-20180119151350-us-east-1.amazonaws.com/usercontent/private/' + Auth.credentials.data.IdentityId + "/" + this.state.file.name;

 //  	$.ajax({
 //  		url: 'https://1rksbard2i.execute-api.us-east-1.amazonaws.com/prod/picture/search',
 //  		type: 'POST',
 //  		headers: {
	//   		"Authorization": idToken,
	// 	    "search-key": fileURL
 //  		},
 //  		success: function(data) {
	//   		console.log(data);
	//   	}
	// });
	var self = this;
  	axios('https://1rksbard2i.execute-api.us-east-1.amazonaws.com/prod/picture/search', {
  		method: 'POST',
	    headers: {
	    	"Authorization": idToken,
	    	"search-key": fileURL
	    }
	  })
	  .then(function (response) {
	    if(response.data.pictures.length == 1 && response.data.pictures[0].s3BucketUrl == fileURL) {
	    	console.log(response);
	    	document.getElementById("loader-container").className = document.getElementById("loader-container").className + " hidden";
			document.getElementById("upload").className = document.getElementById("upload").className + " hidden";
			document.getElementById("file-input-container").className = document.getElementById("file-input-container").className.replace("hidden", "");

			var labels = response.data.pictures[0].labels;
			self.setState({labels:labels});
	    } 
	    else {
	    	setTimeout(self.getLabels, 1000);
	    }
	  })
	  .catch(function (error) {
	    console.log(error);
	  });
  }

  render() {
  	var labels = []
  	if(this.state) { labels = this.state.labels; }
  	
    return (
    	<div>
	    	<div className="col-sm-9">
	    		<form onSubmit={this.onFormSubmit}>
		    		<div className="preview-container">
		    			<div id="loader-container" className="hidden">
			    			<div className="col-xs-12">
			    				<div className="loader"></div>
			    			</div>
			    			<strong id="status" className="title col-xs-12">Uploading</strong>
			    		</div>
		    			<img id="preview" src={ preview }></img>
		    			<h1 className="title" id="file-name"></h1>
		    		</div>
					<label id="file-input-container" className="btn btn-lg btn-info btn-file">
					    Choose Photo or Video File <input id="file-input" type="file" accept="image/*, video/*" onChange={this.onChange}/>
					</label>
				    <button id="upload" className="hidden btn btn-success btn-lg" type="submit">Upload</button>
				</form>
			</div>
			<div className='col-sm-3'>
				<div className="labels-container-title">
					<strong className="title">Labels</strong>
				</div>
				<div className="labels-results">
					<LabelsList labels={labels} />
				</div>
			</div>
		</div>
    );
  }
}

export default Upload;

//<S3Image level="private" picker />

	  //      <div className="Upload">
      //	<input id="input-b1" name="input-b1" type="file" className="file" />
      //</div>