import {connect} from "react-redux";
import {
	resetHistoryDeletedCounterUI, resetSettingsUI, updateSettingUI
} from "../../UIActions";
import CheckboxSetting from "./CheckboxSetting";
import PropTypes from "prop-types";
import React from "react";
import Tooltip from "./SettingsTooltip";

class HistorySettings extends React.Component {
	defaultRetroButtonText = "Retroactively delete by matched expressions";
	state = {retroButtonText: this.defaultRetroButtonText}
	runningRetroDelete = false;

	retroDeleteHistory() {
		this.runningRetroDelete = !this.runningRetroDelete;
		if (!this.runningRetroDelete) {
			this.setState({
				...this.state, retroButtonText: "Click to Restart Retroactive Delete"
			});
			return false;
		}

		let regExList = [];
		this.props.expressions.forEach((ex) => {
			regExList.push(new RegExp(ex.regExp));
		});
		const currentTime = new Date().getTime();

		const searchIntervalInMinutes = 24 * 60 * 60 * 1000;
		const batchSize = 500;
		let deletionCount = 0;

		let getSearchResults = (toTime) => {
			const fromTime = toTime - searchIntervalInMinutes;
			if (fromTime < 0) {return false;}
			if (!this.runningRetroDelete) {return false;}
			this.setState({
				...this.state, retroButtonText: `Click to Stop: Deleted ${deletionCount} entries till ${new Date(fromTime).toLocaleString()}`
			});
			return browser.history.search({
				startTime: fromTime, endTime: toTime, text: "", maxResults: batchSize
			}).then((results) => {
				results.forEach((result) => {
					regExList.forEach((exp) => {
						if (exp.test(result.url)) {
							browser.history.deleteUrl({url: result.url});
							deletionCount++;
						}
					});
				});
				return getSearchResults(fromTime);
			}).catch();
		};

		return getSearchResults(currentTime);
	}

	render() {
		const {
			style,
			settings,
			onUpdateSetting,
			onResetButtonClick,
			onResetCounterButtonClick
		} = this.props;
		return (
			<div style={style}>
				<h1>History Settings</h1>
				<div className="row">
					<div className="col-md-12">
						<CheckboxSetting
							text={"Keep History for "}
							inline={true}
							settingObject={settings.keepHistory}
							updateSetting={(payload) => onUpdateSetting(payload)}
						/>
						<input
							type="number"
							className="form-control"
							style={{display: "inline"}}
							onChange={(e) => onUpdateSetting({
								name: settings.daysToKeep.name, value: e.target.value, id: settings.daysToKeep.id
							})}
							value={settings.daysToKeep.value}
							min="0"
						/>
						<span>Day(s)</span>
						<Tooltip
							text={`
				  History is cleared on startup and for every hour the browser is open.
				  Does a manual cleanup when turning on for the first time.
				  `} zIndex={3}
						/>

					</div>

				</div>

				<div className="row">
					<div className="col-md-9">
						<CheckboxSetting
							text={"Log Total Number Of History Deleted"}
							settingObject={settings.statLogging}
							inline={true}
							updateSetting={(payload) => onUpdateSetting(payload)}
						/>
						<Tooltip
							text={"Counts the number of history deleted during this session and in total. This is shown in the Welcome Screen."}
							zIndex={2}
						/>
					</div>

					<div className="col-md-3">
						<button onClick={() => onResetCounterButtonClick()} className="btn btn-warning" id="resetCounter">
							<span>Reset Counter</span>
						</button>
					</div>

				</div>

				<div className="row">
					<div className="col-md-12">
						<CheckboxSetting
							text={"Show Number of Visits In Browser Icon"}
							settingObject={settings.showVisitsInIcon}
							inline={true}
							updateSetting={(payload) => onUpdateSetting(payload)}
						/>
						<Tooltip
							text={"Shows how many history entries that domain has in your history. Numbers will fluctuate if you have have older history automatically deleted."}
							zIndex={1}
						/>
					</div>
				</div>

				<br /><br />
				<div className="row">
					<div className="col-md-12">
						<button className="btn btn-danger" onClick={() => this.retroDeleteHistory()}>
							<span>{this.state.retroButtonText}</span>
						</button>
						<Tooltip
							text={"This will retroactively delete history that matches the list of expressions. Runs in the background."}
						/>
					</div>
				</div>
				<br />
				<div className="row">
					<div className="col-md-12">
						<button className="btn btn-danger" onClick={() => onResetButtonClick()}>
							<span>Default Settings</span>
						</button>
						<Tooltip
							text={"WARNING: This will also clear your expressions as well. So make a backup of them!"}
						/>
					</div>
				</div>

			</div>
		);
	}
}

HistorySettings.propTypes = {
	style: PropTypes.object,
	settings: PropTypes.object,
	expressions: PropTypes.array.isRequired,
	onUpdateSetting: PropTypes.func,
	onResetButtonClick: PropTypes.func,
	onResetCounterButtonClick: PropTypes.func
};

const mapStateToProps = (state) => ({
	expressions: state.expressions, settings: state.settings
});

const mapDispatchToProps = (dispatch) => ({
	onUpdateSetting(newSetting) {
		dispatch(
			updateSettingUI(newSetting)
		);
	},
	onResetButtonClick() {
		dispatch(
			resetSettingsUI()
		);
	},
	onResetCounterButtonClick() {
		dispatch(
			resetHistoryDeletedCounterUI()
		);
	}
});

export default connect(mapStateToProps, mapDispatchToProps)(HistorySettings);
