import { Auth } from 'aws-amplify';

export const SIGN_IN = "SIGN_IN";
export const SIGN_IN_SUCCESS = "SIGN_IN_SUCCESS";

export function signIn(username, password){
	return {
		type: SIGN_IN,
		payload: Auth.signIn(username, password)
	};	
};

export function signInSuccess() {
	return {
		type: SIGN_IN_SUCCESS,
		payload: {}
	};	
}