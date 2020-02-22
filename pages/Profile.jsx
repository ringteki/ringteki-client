  
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Slider from 'react-bootstrap-slider';

import AlertPanel from '../Components/Site/AlertPanel';
import ApiStatus from '../Components/Site/ApiStatus';
import Panel from '../Components/Site/Panel';
import Form from '../Components/Form/Form';
import Checkbox from '../Components/Form/Checkbox';
import CardSizeOption from '../Components/Profile/CardSizeOption';
import GameBackgroundOption from '../Components/Profile/GameBackgroundOption';
import * as actions from '../actions';
import Avatar from '../Components/Site/Avatar';

class Profile extends React.Component {
    constructor(props) {
        super(props);

        this.handleSelectBackground = this.handleSelectBackground.bind(this);
        this.handleSelectCardSize = this.handleSelectCardSize.bind(this);
        this.onUpdateAvatarClick = this.onUpdateAvatarClick.bind(this);
        this.onSaveClick = this.onSaveClick.bind(this);
        this.onUnlinkClick = this.onUnlinkClick.bind(this);

        this.state = {
            disableGravatar: this.props.user.settings.disableGravatar,
            email: this.props.user.email,
            loading: false,
            newPassword: '',
            newPasswordAgain: '',
            successMessage: '',
            promptedActionWindows: this.props.user.promptedActionWindows,
            validation: {},
            windowTimer: this.props.user.settings.windowTimer,
            optionSettings: this.props.user.settings.optionSettings,
            timerSettings: this.props.user.settings.timerSettings,
            selectedBackground: this.props.user.settings.background,
            selectedCardSize: this.props.user.settings.cardSize
        };

        this.backgrounds = [
            { name: 'none', label: 'None', imageUrl: 'img/blank.png' },
            { name: 'CRAB', label: 'Crab', imageUrl: 'img/bgs/crab.png' },
            { name: 'CRANE', label: 'Crane', imageUrl: 'img/bgs/crane.png' },
            { name: 'DRAGON', label: 'Dragon', imageUrl: 'img/bgs/dragon.png' },
            { name: 'LION', label: 'Lion', imageUrl: 'img/bgs/lion.png' },
            { name: 'MANTIS', label: 'Mantis', imageUrl: 'img/bgs/mantis.png' },
            { name: 'PHOENIX', label: 'Phoenix', imageUrl: 'img/bgs/phoenix.png' },
            { name: 'SCORPION', label: 'Scorpion', imageUrl: 'img/bgs/scorpion.png' },
            { name: 'SPIDER', label: 'Spider', imageUrl: 'img/bgs/spider.png' },
            { name: 'UNICORN', label: 'Unicorn', imageUrl: 'img/bgs/unicorn.png' }
        ];

        this.cardSizes = [
            { name: 'small', label: 'Small' },
            { name: 'normal', label: 'Normal' },
            { name: 'large', label: 'Large' },
            { name: 'x-large', label: 'Extra-Large' }
        ];

        this.windows = [
            { name: 'dynasty', label: 'Dynasty phase', style: 'col-sm-4' },
            { name: 'draw', label: 'Draw phase', style: 'col-sm-4' },
            { name: 'preConflict', label: 'Conflict phase', style: 'col-sm-4' },
            { name: 'conflict', label: 'During conflict', style: 'col-sm-4' },
            { name: 'fate', label: 'Fate phase', style: 'col-sm-4' }
        ];

        if(!this.props.user) {
            return;
        }
    }

    componentDidMount() {
        this.updateProfile(this.props);
    }

    componentWillReceiveProps(props) {
        if(!props.user) {
            return;
        }

        // If we haven't previously got any user details, then the api probably just returned now, so set the initial user details
        if(!this.state.promptedActionWindows) {
            this.updateProfile(props);
        }

        if(props.profileSaved) {
            this.setState({
                successMessage: 'Profile saved successfully.  Please note settings changed here may only apply at the start of your next game.'
            });

            this.updateProfile(props);

            setTimeout(() => {
                this.setState({ successMessage: undefined });
            }, 5000);
        }
    }

    updateProfile(props) {
        if(!props.user) {
            return;
        }

        this.setState({
            email: props.user.email,
            disableGravatar: props.user.settings.disableGravatar,
            promptedActionWindows: props.user.promptedActionWindows,
            windowTimer: props.user.settings.windowTimer,
            timerSettings: props.user.settings.timerSettings,
            optionSettings: props.user.settings.optionSettings,
            selectedBackground: props.user.settings.background,
            selectedCardSize: props.user.settings.cardSize
        });
    }

    onChange(field, event) {
        var newState = {};

        newState[field] = event.target.value;
        this.setState(newState);
    }

    onWindowToggle(field, event) {
        var newState = {};
        newState.promptedActionWindows = this.state.promptedActionWindows;

        newState.promptedActionWindows[field] = event.target.checked;
        this.setState(newState);
    }

    onTimerSettingToggle(field, event) {
        var newState = {};
        newState.timerSettings = this.state.timerSettings;

        newState.timerSettings[field] = event.target.checked;
        this.setState(newState);
    }

    onOptionSettingToggle(field, event) {
        var newState = {};
        newState.optionSettings = this.state.optionSettings;

        newState.optionSettings[field] = event.target.checked;
        this.setState(newState);
    }

    onSaveClick() {
        this.setState({ successMessage: undefined });

        document.getElementsByClassName('wrapper')[0].scrollTop = 0;

        this.props.saveProfile(this.props.user.username, {
            email: this.state.email,
            password: this.state.newPassword,
            promptedActionWindows: this.state.promptedActionWindows,
            enableGravatar: this.state.disableGravatar,
            settings: {
                windowTimer: this.state.windowTimer,
                timerSettings: this.state.timerSettings,
                optionSettings: this.state.optionSettings,
                background: this.state.selectedBackground,
                cardSize: this.state.selectedCardSize
            }
        });
    }

    onSlideStop(event) {
        let value = parseInt(event.target.value);

        if(isNaN(value)) {
            return;
        }

        if(value < 0) {
            value = 0;
        }

        if(value > 10) {
            value = 10;
        }

        this.setState({ windowTimer: value });
    }

    handleSelectBackground(background) {
        this.setState({ selectedBackground: background });
    }

    handleSelectCardSize(size) {
        this.setState({ selectedCardSize: size });
    }

    onUpdateAvatarClick(event) {
        event.preventDefault();

        this.props.updateAvatar(this.props.user.username);
    }

    onUnlinkClick() {
        this.props.unlinkPatreon();
    }

    isPatreonLinked() {
        return ['linked', 'pledged'].includes(this.props.user.patreon);
    }

    render() {
        if(!this.props.user || !this.state.promptedActionWindows) {
            return <AlertPanel type='error' message='You must be logged in to update your profile' />;
        }

        let windows = this.windows.map(window => {
            return (<Checkbox key={ window.name }
                noGroup
                name={ 'promptedActionWindows.' + window.name }
                label={ window.label }
                fieldClass={ window.style }
                type='checkbox'
                onChange={ (this.onWindowToggle.bind(this, window.name)) }
                checked={ this.state.promptedActionWindows[window.name] } />);
        });

        if(this.props.profileSaved) {
            setTimeout(() => {
                this.props.clearProfileStatus();
            }, 5000);
        }

        let initialValues = { email: this.props.user.email };
        let callbackUrl = process.env.NODE_ENV === 'production' ? 'https://jigoku.online/patreon' : 'http://localhost:8080/patreon';

        //TODO Update profile for ringteki
        return (
            <div className='col-sm-8 col-sm-offset-2 profile full-height'>
                <div className='about-container'>
                    <ApiStatus apiState={ this.props.apiState } successMessage={ this.state.successMessage } />

                    <form className='form form-horizontal'>
                        <div className='panel-title'>
                            Profile
                        </div>
                        <div className='panel'>
                            <Input name='email' label='Email Address' labelClass='col-sm-4' fieldClass='col-sm-8' placeholder='Enter email address'
                                type='text' onChange={ this.onChange.bind(this, 'email') } value={ this.state.email }
                                onBlur={ this.verifyEmail.bind(this) } validationMessage={ this.state.validation['email'] } />
                            <Input name='newPassword' label='New Password' labelClass='col-sm-4' fieldClass='col-sm-8' placeholder='Enter new password'
                                type='password' onChange={ this.onChange.bind(this, 'newPassword') } value={ this.state.newPassword }
                                onBlur={ this.verifyPassword.bind(this, false) } validationMessage={ this.state.validation['password'] } />
                            <Input name='newPasswordAgain' label='New Password (again)' labelClass='col-sm-4' fieldClass='col-sm-8' placeholder='Enter new password (again)'
                                type='password' onChange={ this.onChange.bind(this, 'newPasswordAgain') } value={ this.state.newPasswordAgain }
                                onBlur={ this.verifyPassword.bind(this, false) } validationMessage={ this.state.validation['password1'] } />
                            <Checkbox name='disableGravatar' label='Disable Gravatar integration' fieldClass='col-sm-offset-4 col-sm-8'
                                onChange={ e => this.setState({ disableGravatar: e.target.checked }) } checked={ this.state.disableGravatar } />
                        </div>
                        <div>
                            <div className='panel-title'>
                                Action window defaults
                            </div>
                            <div className='panel'>
                                <p className='help-block small'>If an option is selected here, you will always be prompted if you want to take an action in that window.  If an option is not selected, you will receive no prompts for that window.  For some windows (e.g. dominance) this could mean the whole window is skipped.</p>
                                <div className='form-group'>
                                    { windows }
                                </div>
                            </div>
                            <div className='panel-title'>
                                Timed Bluff Window
                            </div>
                            <div className='panel'>
                                <p className='help-block small'>Sometimes, it is useful to have the game prompt you to play an event, even when you can't play one, as it makes it more difficult for your opponent to deduce what you have in your hand. This 'bluff' window has a timer will count down.
                                At the end of that timer, the window will automatically pass. This option controls the duration of the timer.  The timer will only show when you *don't* have an ability which can be used. The timer can be configure to show when events are played by your opponent, or
                                to show when there's a window to play an event which you don't currently have in your hand.</p>
                                <div className='form-group'>
                                    <label className='col-sm-3 control-label'>Window timeout</label>
                                    <div className='col-sm-5'>
                                        <Slider value={ this.state.windowTimer }
                                            slideStop={ this.onSlideStop.bind(this) }
                                            step={ 1 }
                                            max={ 10 }
                                            min={ 0 } />
                                    </div>
                                    <div className='col-sm-2'>
                                        <input className='form-control text-center' name='timer' value={ this.state.windowTimer } onChange={ this.onSlideStop.bind(this) } />
                                    </div>
                                    <label className='col-sm-1 control-label'>seconds</label>

                                    <Checkbox name='timerSettings.events' noGroup label={ 'Show timer for opponent\'s events' } fieldClass='col-sm-6'
                                        onChange={ this.onTimerSettingToggle.bind(this, 'events') } checked={ this.state.timerSettings.events } />
                                    <Checkbox name='timerSettings.abilities' noGroup label={ 'Show timer for events in my deck' } fieldClass='col-sm-6'
                                        onChange={ this.onTimerSettingToggle.bind(this, 'eventsInDeck') } checked={ this.state.timerSettings.eventsInDeck } />
                                </div>
                            </div>
                            <div className='panel-title'>
                                Options
                            </div>
                            <div className='panel'>
                                <div className='form-group'>
                                    <Checkbox
                                        name='optionSettings.markCardsUnselectable'
                                        noGroup
                                        label={ 'Grey out cards with no relevant abilities during interrupt/reaction windows' }
                                        fieldClass='col-sm-6'
                                        onChange={ this.onOptionSettingToggle.bind(this, 'markCardsUnselectable') }
                                        checked={ this.state.optionSettings.markCardsUnselectable }
                                    />
                                    <Checkbox
                                        name='optionSettings.cancelOwnAbilities'
                                        noGroup
                                        label={ 'Prompt to cancel/react to initiation of my own abilities' }
                                        fieldClass='col-sm-6'
                                        onChange={ this.onOptionSettingToggle.bind(this, 'cancelOwnAbilities') }
                                        checked={ this.state.optionSettings.cancelOwnAbilities } />
                                    <Checkbox
                                        name='optionSettings.orderForcedAbilities'
                                        noGroup
                                        label={ 'Prompt to order forced triggered/simultaneous abilities' }
                                        fieldClass='col-sm-6'
                                        onChange={ this.onOptionSettingToggle.bind(this, 'orderForcedAbilities') }
                                        checked={ this.state.optionSettings.orderForcedAbilities }
                                    />
                                    <Checkbox
                                        name='optionSettings.confirmOneClick'
                                        noGroup
                                        label={ 'Show a confirmation prompt when initating 1-click abilities' }
                                        fieldClass='col-sm-6'
                                        onChange={ this.onOptionSettingToggle.bind(this, 'confirmOneClick') }
                                        checked={ this.state.optionSettings.confirmOneClick }
                                    />
                                    <Checkbox
                                        name='optionSettings.disableCardStats'
                                        noGroup
                                        label={ 'Disable card hover statistics popup' }
                                        fieldClass='col-sm-6'
                                        onChange={ this.onOptionSettingToggle.bind(this, 'disableCardStats') }
                                        checked={ this.state.optionSettings.disableCardStats }
                                    />
                                </div>
                            </div>
                        </div>
                        <div>
                            <div className='panel-title'>
                                Game Board Background
                            </div>
                            <div className='panel'>
                                <div className='row'>
                                    <div className='col-sm-4' onClick={ () => this.onBackgroundClick('none') }>
                                        <img className={ 'img-responsive' + (this.state.selectedBackground === 'none' ? ' selected' : '') }
                                            src='img/blank.png' />
                                        <span className='bg-label'>None</span>
                                    </div>
                                    <div className='col-sm-4' onClick={ () => this.onBackgroundClick('CRAB') }>
                                        <img className={ 'img-responsive' + (this.state.selectedBackground === 'CRAB' ? ' selected' : '') }
                                            src='/img/bgs/crab.jpg' />
                                        <span className='bg-label'>Crab</span>
                                    </div>
                                    <div className='col-sm-4' onClick={ () => this.onBackgroundClick('CRANE') }>
                                        <img className={ 'img-responsive' + (this.state.selectedBackground === 'CRANE' ? ' selected' : '') }
                                            src='/img/bgs/crane.jpg' />
                                        <span className='bg-label'>Crane</span>
                                    </div>
                                </div>
                                <div className='row'>
                                    <div className='col-sm-4' onClick={ () => this.onBackgroundClick('DRAGON') }>
                                        <img className={ 'img-responsive' + (this.state.selectedBackground === 'DRAGON' ? ' selected' : '') }
                                            src='/img/bgs/dragon.jpg' />
                                        <span className='bg-label'>Dragon</span>
                                    </div>
                                    <div className='col-sm-4' onClick={ () => this.onBackgroundClick('LION') }>
                                        <img className={ 'img-responsive' + (this.state.selectedBackground === 'LION' ? ' selected' : '') }
                                            src='/img/bgs/lion.jpg' />
                                        <span className='bg-label'>Lion</span>
                                    </div>
                                    <div className='col-sm-4' onClick={ () => this.onBackgroundClick('MANTIS') }>
                                        <img className={ 'img-responsive' + (this.state.selectedBackground === 'MANTIS' ? ' selected' : '') }
                                            src='/img/bgs/mantis.jpg' />
                                        <span className='bg-label'>Mantis</span>
                                    </div>
                                </div>
                                <div className='row'>
                                    <div className='col-sm-4' onClick={ () => this.onBackgroundClick('PHOENIX') }>
                                        <img className={ 'img-responsive' + (this.state.selectedBackground === 'PHOENIX' ? ' selected' : '') }
                                            src='/img/bgs/phoenix.jpg' />
                                        <span className='bg-label'>Phoenix</span>
                                    </div>
                                    <div className='col-sm-4' onClick={ () => this.onBackgroundClick('SCORPION') }>
                                        <img className={ 'img-responsive' + (this.state.selectedBackground === 'SCORPION' ? ' selected' : '') }
                                            src='/img/bgs/scorpion.jpg' />
                                        <span className='bg-label'>Scorpion</span>
                                    </div>
                                    <div className='col-sm-4' onClick={ () => this.onBackgroundClick('SPIDER') }>
                                        <img className={ 'img-responsive' + (this.state.selectedBackground === 'SPIDER' ? ' selected' : '') }
                                            src='/img/bgs/spider.jpg' />
                                        <span className='bg-label'>Spider</span>
                                    </div>
                                </div>
                                <div className='row'>
                                    <div className='col-sm-4' onClick={ () => this.onBackgroundClick('UNICORN') }>
                                        <img className={ 'img-responsive' + (this.state.selectedBackground === 'UNICORN' ? ' selected' : '') }
                                            src='/img/bgs/unicorn.jpg' />
                                        <span className='bg-label'>Unicorn</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div>
                            <div className='panel-title'>
                                Card Image Size
                            </div>
                            <div className='panel'>
                                <div className='row'>
                                    <div className='col-xs-12'>
                                        <div className='card-settings' onClick={ () => this.onCardClick('small') }>
                                            <div className={ 'card small vertical' + (this.state.selectedCardSize === 'small' ? ' selected' : '') }>
                                                <img className='card small vertical'
                                                    src='img/cards/dynastycardback.jpg' />
                                            </div>
                                            <span className='bg-label'>Small</span>
                                        </div>
                                        <div className='card-settings' onClick={ () => this.onCardClick('normal') }>
                                            <div className={ 'card vertical' + (this.state.selectedCardSize === 'normal' ? ' selected' : '') }>
                                                <img className='card vertical'
                                                    src='img/cards/dynastycardback.jpg' />
                                            </div>
                                            <span className='bg-label'>Normal</span>
                                        </div>
                                        <div className='card-settings' onClick={ () => this.onCardClick('large') }>
                                            <div className={ 'card vertical large' + (this.state.selectedCardSize === 'large' ? ' selected' : '') } >
                                                <img className='card-image large vertical'
                                                    src='/img/cards/dynastycardback.jpg' />
                                            </div>
                                            <span className='bg-label'>Large</span>
                                        </div>
                                        <div className='card-settings' onClick={ () => this.onCardClick('x-large') }>
                                            <div className={ 'card vertical x-large' + (this.state.selectedCardSize === 'x-large' ? ' selected' : '') }>
                                                <img className='card-image x-large vertical'
                                                    src='img/cards/dynastycardback.jpg' />
                                            </div>
                                            <span className='bg-label'>Extra-Large</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='col-sm-offset-10 col-sm-2'>
                            <button className='btn btn-primary' type='button' disabled={ this.state.loading } onClick={ this.onSaveClick.bind(this) }>Save</button>
                        </div>
                    </form>
                </div>
            </div>);
    }
}

Profile.displayName = 'Profile';
Profile.propTypes = {
    refreshUser: PropTypes.func,
    socket: PropTypes.object,
    user: PropTypes.object
};

function mapStateToProps(state) {
    return {
        socket: state.socket.socket,
        user: state.auth.user
    };
}

export default connect(mapStateToProps, actions)(Profile);
