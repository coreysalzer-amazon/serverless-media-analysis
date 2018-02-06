import React, { Component } from 'react';
import { S3Image } from 'aws-amplify-react';
import { Storage, Auth } from 'aws-amplify';
import "../styles/upload.css";
import preview from '../img/preview.jpg';
import axios from 'axios';
import $ from 'jquery';
import Loader from "./Loader";


class LabelsList extends Component {
    render() {
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
        if(listComponents.length === 0) {
        	listComponents = <div className="labels"></div>;
        }
        return <div>{listComponents}</div>;
    }
}

class Upload extends Component {
  constructor(props) {
    super(props);
    Storage.configure({ level: 'private', track: true });
    this.onChange = this.onChange.bind(this);
    this.onFormSubmit = this.onFormSubmit.bind(this);
    this.getLabels = this.getLabels.bind(this);
  }

  componentDidMount() {
  	this.setState({
  		labels:[],
  		isUploading: false,
  		isAnalyzing: false,
  		canUpload: false
  	});
  }

  onChange(e) {
  	if(e.target.files.length > 1) {
  		alert("Nice! You tried to use a feature on our roadmap. Unforunately, right now, you can only upload 1 photo or video at a time, so we took your first file. Multiple file uploads is coming soon, so stay tuned ;) ");
  	}
  	this.setState({
  		file:e.target.files[0],
  		labels:[],
  		isUploading: false,
  		isAnalyzing: false,
  		canUpload: true
  	});

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
	this.setState({
		labels: [],
		isUploading: true,
		isAnalyzing: false,
		canUpload: false
	});

	var self = this;
    Storage.put(this.state.file.name, this.state.file)
        .then (function(result) {
        	console.log(result);
        	self.setState({
				labels: [],
				isUploading: false,
				isAnalyzing: true,
				canUpload: false
			});
        	self.getLabels();

        })
        .catch(err => console.log(err));

  }

  getLabels() {
  	var idToken = Auth.credentials.params.Logins["cognito-idp.us-east-1.amazonaws.com/us-east-1_BIhRQnDpw"];
  	var fileURL = 'rekognition-20180119151350.rekognition-20180119151350-us-east-1.amazonaws.com/usercontent/private/' + Auth.credentials.data.IdentityId + "/" + this.state.file.name;

	var self = this;
  	axios('https://1rksbard2i.execute-api.us-east-1.amazonaws.com/prod/picture/search', {
  		method: 'POST',
	    headers: {
	    	"Authorization": idToken,
	    	"search-key": fileURL
	    }
	  })
	  .then(function (response) {
	    if(response.data.pictures.length === 1 && response.data.pictures[0].s3BucketUrl === fileURL) {
	    	console.log(response);
			var labels = response.data.pictures[0].labels;
			self.setState({
				labels: labels,
				isUploading: false,
				isAnalyzing: false,
				canUpload: true
			});
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
  	var isUploading = false;
  	var isAnalyzing = false;
  	var canUpload = false;
  	if(this.state) { 
  		labels = this.state.labels; 
  		isUploading = this.state.isUploading;
  		isAnalyzing = this.state.isAnalyzing;
  		canUpload = this.state.canUpload;
  	}
  	
    return (
    	<div>
	    	<div className="col-sm-9">
	    		<form onSubmit={this.onFormSubmit}>
		    		<div onClick={ () => $('input[type=file]').trigger('click') } className="preview-container">
		    			{ isUploading && <Loader title="Uploading"/> }
		    			{ isAnalyzing && <Loader title="Analyzing"/> }
		    			<img className={ isUploading || isAnalyzing ? "dim" : "" } id="preview" src={ preview }></img>
		    			<h1 className="title" id="file-name"></h1>
		    		</div>
		    		<button onClick={ (e) => { if(e.target.id === "file-input-container") $('input[type=file]').trigger('click') } } 
		    			type="button" id="file-input-container" className={ "btn btn-lg btn-info btn-file col-xs-12" + (!canUpload && !isUploading && !isAnalyzing ? "" : " hidden") }>
						<label className="btn-file">
						    Choose Photo or Video File(s) <input id="file-input" type="file" accept="image/*, video/*" multiple onChange={this.onChange}/>
						</label>
					</button>
				    { canUpload && <button id="upload" className="btn btn-success btn-lg col-xs-12" type="submit">Upload</button> }
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