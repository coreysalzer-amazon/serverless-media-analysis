import React, { Component } from 'react';
import MediaResult from './MediaResult';
import $ from 'jquery';


class ResultsRow extends Component {
	render() {
		var isLoading = this.props.isLoading;

		var resultsRowList = this.props.results.map(function(result) {
            var fileName = result.s3BucketUrl.substring(result.s3BucketUrl.lastIndexOf("/") + 1, result.s3BucketUrl.length);
		   	var uniqueLabels = [];
			$.each(result.labels, function(i, el){
			    if($.inArray(el, uniqueLabels) === -1) uniqueLabels.push(el);
			});

    		return(
            	<div className="result col-md-4 col-xs-12" key={result.id}>
        			<MediaResult fileName={ fileName } />
        			<i className="block-text col-xs-12">{ "Labels: " + uniqueLabels.join(", ") }</i>
        		</div>
        	);		
        });
        if(resultsRowList.length == 0) {
        	resultsRowList = <div className="result col-md-4 col-xs-12"></div>;
        }
        return(<div className="row row-eq-height">{resultsRowList}</div>);
	}
}

export default ResultsRow;