import React, { Component } from 'react';
import { Storage } from 'aws-amplify';
import preview from '../img/preview.jpg';
import Loader from './Loader';


class MediaResult extends Component {
	constructor(props) {
		super(props);
		this.loadError = this.loadError.bind(this);

		if (this.props.fileName) {
			var self = this;
			Storage.get(this.props.fileName, { level: "private" })
		        .then (function(response) {
		        	console.log(response);
		        	var file = response;
		            self.setState({
		            	file: file,
		            	isLoading: false
		            });
		        })
	    		.catch(function(err){
	    			console.log(err);
	    			self.setState({
	    				file: preview,
	    				isLoading: false
	    			});
	    		});
		}
	}

	componentWillMount() {
		this.setState({
			file: preview,
			isLoading: true
		});
	}

	loadError(e) {
		e.target.onerror=null;
		e.target.src= preview;
	}

	render() {
		var fileName = this.props.fileName;
		var file = preview;
		var isLoading = true;
  		if(this.state) { 
  			file = this.state.file; 
  			isLoading = this.state.isLoading;
  		}

  		if(file.includes(".mov") || file.includes(".mp4")) {
  			return(
  				<div>
  					<video className="col-xs-12" muted autoPlay controls loop src= { file } alt="Video Not Found" onError= { this.loadError }></video>
  				    <a href={ file } className="result-name col-xs-12">{ fileName }</a>
        		</div>
  			);
  		}

        return(
        	<div>
        		{ isLoading && <Loader title="Loading"/> }
        		<div className="col-xs-12">
        			<img src= { file } alt="Image Not Found" onError={ this.loadError }></img>
        		</div>
        		<a href={ file } className="block-text result-name col-xs-12">{ fileName }</a>
        	</div>
        );

	}
}

export default MediaResult;