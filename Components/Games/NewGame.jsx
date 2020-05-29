import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Panel from '../Site/Panel';
import * as actions from '../../actions';
import AlertPanel from '../Site/AlertPanel';

const GameNameMaxLength = 140;

const defaultTime = {
    timer: '60',
    chess: '40',
    hourglass: '15',
    byoyomi: '0'
};

class NewGame extends React.Component {
    constructor() {
        super();

        this.onCancelClick = this.onCancelClick.bind(this);
        this.onSubmitClick = this.onSubmitClick.bind(this);
        this.onNameChange = this.onNameChange.bind(this);
        this.onClockClick = this.onClockClick.bind(this);
        this.onSpectatorsClick = this.onSpectatorsClick.bind(this);
        this.onSpectatorSquelchClick = this.onSpectatorSquelchClick.bind(this);
        this.onPasswordChange = this.onPasswordChange.bind(this);

        this.state = {
            spectators: true,
            spectatorSquelch: false,
            clocks: false,
            selectedClockType: 'timer',
            clockTimer: 60,
            byoyomiPeriods: 5,
            byoyomiTimePeriod: 30,
            selectedGameType: 'casual',
            password: ''
        };
    }

    componentWillMount() {
        this.setState({ gameName: this.props.defaultGameName });
    }

    onCancelClick(event) {
        event.preventDefault();

        this.props.cancelNewGame();
    }

    onNameChange(event) {
        this.setState({ gameName: event.target.value });
    }

    onPasswordChange(event) {
        this.setState({ password: event.target.value });
    }

    onSpectatorsClick(event) {
        this.setState({ spectators: event.target.checked });
    }

    onSpectatorSquelchClick(event) {
        this.setState({ spectatorSquelch: event.target.checked });
    }

    onClockClick(event) {
        this.setState({ clocks: event.target.checked });
    }

    onSubmitClick(event) {
        event.preventDefault();

        let clocks = {
            type: this.state.clocks ? this.state.selectedClockType : 'none',
            time: this.state.clocks ? this.state.clockTimer : 0,
            periods: this.state.clocks ? this.state.byoyomiPeriods : 0,
            timePeriod: this.state.clocks ? this.state.byoyomiTimePeriod : 0
        };

        this.props.socket.emit('newgame', {
            name: this.state.gameName,
            spectators: this.state.spectators,
            spectatorSquelch: this.state.spectatorSquelch,
            gameType: this.state.selectedGameType,
            clocks: clocks,
            password: this.state.password,
            quickJoin: this.props.quickJoin
        });
    }

    onRadioChange(gameType) {
        this.setState({ selectedGameType: gameType });
    }

    onClockRadioChange(clockType) {
        this.setState({ selectedClockType: clockType, clockTimer: defaultTime[clockType] });
    }

    isGameTypeSelected(gameType) {
        return this.state.selectedGameType === gameType;
    }

    isClockTypeSelected(clockType) {
        return this.state.selectedClockType === clockType;
    }

    getOptions() {
        return (<div className='row'>
            <div className='checkbox col-sm-8'>
                <label>
                    <input type='checkbox' onChange={ this.onSpectatorsClick } checked={ this.state.spectators } />
                    Allow spectators
                </label>
            </div>
            <div className='checkbox col-sm-8'>
                <label>
                    <input type='checkbox' onChange={ this.onSpectatorSquelchClick } checked={ this.state.spectatorSquelch } />
                    Don't allow spectators to chat
                </label>
            </div>
            <div className='checkbox col-sm-8'>
                <label>
                    <input type='checkbox' onChange={ this.onClockClick } checked={ this.state.clocks } />
                    Timed game
                </label>
            </div>
        </div>);
    }

    getClockOptions() {
        return (
            <div>
                <div className='row game-password'>
                    <div className='col-sm-12'>
                        <b>Clocks</b>
                    </div>
                    <div className='col-sm-10'>
                        <label className='radio-inline'>
                            <input type='radio' onChange={ this.onClockRadioChange.bind(this, 'timer') } checked={ this.isClockTypeSelected('timer') } />
                            Timer
                        </label>
                        <label className='radio-inline'>
                            <input type='radio' onChange={ this.onClockRadioChange.bind(this, 'chess') } checked={ this.isClockTypeSelected('chess') } />
                            Chess
                        </label>
                        <label className='radio-inline'>
                            <input type='radio' onChange={ this.onClockRadioChange.bind(this, 'hourglass') } checked={ this.isClockTypeSelected('hourglass') } />
                            Hourglass
                        </label>
                        <label className='radio-inline'>
                            <input type='radio' onChange={ this.onClockRadioChange.bind(this, 'byoyomi') } checked={ this.isClockTypeSelected('byoyomi') } />
                            Byoyomi
                        </label>
                    </div>
                </div>
                <div className='row'>
                    <div className='col-sm-8'>
                        <label>Main Time (Minutes)</label>
                        <input className='form-control' value={ this.state.clockTimer } onChange={ event => this.setState({ clockTimer: event.target.value.replace(/\D/,'') }) }/>
                    </div>
                </div>
                { this.state.selectedClockType === 'byoyomi' &&
                    <div className='row'>
                        <div className='col-sm-8'>
                            <label>Number of Byoyomi Periods</label>
                            <input className='form-control' value={ this.state.byoyomiPeriods } onChange={ event => this.setState({ byoyomiPeriods: event.target.value.replace(/\D/, '') }) }/>
                            <label>Byoyomi Time Period (Seconds)</label>
                            <input className='form-control' value={ this.state.byoyomiTimePeriod } onChange={ event => this.setState({ byoyomiTimePeriod: event.target.value.replace(/\D/, '') }) }/>
                        </div>
                    </div>
                }
            </div>
        );
    }

    getGameTypeOptions() {
        return (
            <div className='row'>
                <div className='col-sm-12 game-type'>
                    <b>Game Type</b>
                </div>
                <div className='col-sm-10'>
                    <label className='radio-inline'>
                        <input type='radio' onChange={ this.onRadioChange.bind(this, 'beginner') } checked={ this.isGameTypeSelected('beginner') } />
                        Beginner
                    </label>
                    <label className='radio-inline'>
                        <input type='radio' onChange={ this.onRadioChange.bind(this, 'casual') } checked={ this.isGameTypeSelected('casual') } />
                        Casual
                    </label>
                    <label className='radio-inline'>
                        <input type='radio' onChange={ this.onRadioChange.bind(this, 'competitive') } checked={ this.isGameTypeSelected('competitive') } />
                        Competitive
                    </label>
                </div>
            </div>);
    }

    render() {
        let charsLeft = GameNameMaxLength - this.state.gameName.length;
        let content = [];

        if(this.props.quickJoin) {
            content =
                (<div>
                    <AlertPanel type='info' message="Select the type of game you'd like to play and either you'll join the next one available, or one will be created for you with default options." />
                    { this.getGameTypeOptions() }
                </div>);
        } else {
            content = (<div>
                <div className='row'>
                    <div className='col-sm-8'>
                        <label htmlFor='gameName'>Name</label>
                        <label className='game-name-char-limit'>{ charsLeft >= 0 ? charsLeft : 0 }</label>
                        <input className='form-control' placeholder='Game Name' type='text' onChange={ this.onNameChange } value={ this.state.gameName } maxLength={ GameNameMaxLength } />
                    </div>
                </div>
                { this.getOptions() }
                { this.getGameTypeOptions() }
                { this.state.clocks ? this.getClockOptions() : null }
                <div className='row game-password'>
                    <div className='col-sm-8'>
                        <label>Password</label>
                        <input className='form-control' type='password' onChange={ this.onPasswordChange } value={ this.state.password } />
                    </div>
                </div>
            </div>);
        }

        return this.props.socket ? (
            <div>
                <Panel title={ this.props.quickJoin ? 'Join Existing or Start New Game' : 'New game' }>
                    <form className='form'>
                        { content }
                        <div className='button-row'>
                            <button className='btn btn-primary' onClick={ this.onSubmitClick }>Start</button>
                            <button className='btn btn-primary' onClick={ this.onCancelClick }>Cancel</button>
                        </div>
                    </form>
                </Panel >
            </div >) : (
            <div>
                <AlertPanel type='warning' message='Your connection to the lobby has been interrupted, if this message persists, refresh your browser' />
            </div>
        );
    }
}

NewGame.displayName = 'NewGame';
NewGame.propTypes = {
    cancelNewGame: PropTypes.func,
    defaultGameName: PropTypes.string,
    quickJoin: PropTypes.bool,
    socket: PropTypes.object
};

function mapStateToProps(state) {
    return {
        socket: state.lobby.socket
    };
}

export default connect(mapStateToProps, actions)(NewGame);
