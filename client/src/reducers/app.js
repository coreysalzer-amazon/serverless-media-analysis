import { 
	SIGN_IN,
} from '../actions/app';

const INITIAL_STATE = { };

export default function(state=INITIAL_STATE, action){
	switch(action.type){
		case SIGN_IN:
			return {
				...state
			};
			break;
		default:
			return state;
			break;
	}
};
