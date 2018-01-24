import React, { Component } from 'react';
import { S3Image } from 'aws-amplify-react';
import { Storage } from 'aws-amplify';
import "../styles/upload.css";
import preview from '../img/preview.jpg';


class Upload extends Component {
  constructor(props) {
    super(props);
    Storage.configure({ level: 'private', track: true });
    this.onChange = this.onChange.bind(this);
    this.onFormSubmit = this.onFormSubmit.bind(this);
  }

  onChange(e) {
  	this.setState({file:e.target.files[0]});
  	document.getElementById("file-input-container").className = document.getElementById("upload").className + " hidden";
  	document.getElementById("upload").className = document.getElementById("upload").className.replace("hidden", "");
  	
  	if(e.target.files[0].type.includes("image")) {
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

    Storage.put(this.state.file.name, this.state.file)
        .then (function(result) {
        	console.log(result);
        	document.getElementById("status").innerHTML = "Analyzing";
        	//this.getLabels();

        })
        .catch(err => console.log(err));

  }

  render() {
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
				<div className="labels-results"></div>
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