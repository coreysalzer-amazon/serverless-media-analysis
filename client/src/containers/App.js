import AppComponent from '../components/App';
import { Auth } from 'aws-amplify';
import { connect } from 'react-redux';
import { 
	signIn,
	signInSuccess,
	user
} from '../actions/app';


const mapDispatchToProps = (dispatch) => {
	return {
		signIn: (username, password) => {
			let res = dispatch(signIn(username, password));

			res.payload
				.then(function(user) {
			      dispatch(signInSuccess(user));
			    })
				.catch(err => console.log(err));
		},
		User: (signedIn) => {
			dispatch(signedIn(signedIn));	
		}
	};
};

function mapStateToProps(state){
	return {
		app: state.app,
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(AppComponent);
//export default connect()(AppComponent);

