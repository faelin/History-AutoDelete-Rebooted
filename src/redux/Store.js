import {applyMiddleware, createStore} from "redux";
import {createBackgroundStore} from "redux-webext";
import reducer from "./Reducers";
import thunk from "redux-thunk";
import {
	addExpression,
	addRawExpression,
	removeExpression,
	resetHistoryDeletedCounter,
	resetSettings,
	updateExpression,
	updateSetting
} from "./Actions";
const consoleMessages = (store) => (next) => (action) => {
	let result;

	// console.log(
	// 	`dispatching action => ${action.type}
	// payload => ${JSON.stringify(action.payload)}`);

	result = next(action);

	return result;
};

const actions = {
	UPDATE_SETTING: updateSetting,
	RESET_SETTINGS: resetSettings,
	ADD_EXPRESSION: addExpression,
	ADD_RAW_EXPRESSION: addRawExpression,
	REMOVE_EXPRESSION: removeExpression,
	UPDATE_EXPRESSION: updateExpression,
	RESET_HISTORY_DELETED_COUNTER: resetHistoryDeletedCounter
};

export default (state = {}) => createBackgroundStore({
	store: createStore(reducer, state, applyMiddleware(thunk, consoleMessages)),
	actions
});
