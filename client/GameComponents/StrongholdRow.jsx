import React from 'react';
import PropTypes from 'prop-types';

import Province from './Province.jsx';
import Placeholder from './Placeholder.jsx';
import CardPile from './CardPile.jsx';

class StrongholdRow extends React.Component {

    getFavor(player) {
        return (
            <div className={ `card-wrapper imperial-favor vertical ${this.props.cardSize} ${ player && player.imperialFavor ? '' : 'hidden'}` }>
                {
                    player &&
                    <img
                        className={ `card-image imperial-favor ${ this.props.cardSize } ${player.imperialFavor ? '' : 'hidden'} ` }
                        src={ '/img/' + (player.imperialFavor ? player.imperialFavor : 'political') + '-favor.jpg' }
                    />
                }
            </div>
        );
    }

    getFaction(player) {
        if(player.faction) {
            let faction = player.faction.name.toLowerCase();
            let tokens = faction.split(' ');
            return tokens[0];
        }
        return 'crab';
    }

    getStronghold(player, isSkirmish) {
        if(!isSkirmish) {
            if(this.props.isMe) {
                return (
                    <Province isMe={ this.props.isMe } source='stronghold province' cards={ this.props.strongholdProvinceCards } onMouseOver={ this.props.onMouseOver } onMouseOut={ this.props.onMouseOut } onDragDrop={ this.props.onDragDrop } size={ this.props.cardSize } onCardClick={ this.props.onCardClick } onMenuItemClick={ this.props.onMenuItemClick } />
                );
            }
            return (
                <Province isMe={ this.props.isMe } source='stronghold province' cards={ this.props.strongholdProvinceCards } onMouseOver={ this.props.onMouseOver } onMouseOut={ this.props.onMouseOut } onCardClick={ this.props.onCardClick } size={ this.props.cardSize } />
            );

        }
        if(player && this.getFaction(player)) {
            return (
                <div className={ `card-wrapper skirmish-stronghold vertical ${this.props.cardSize}` }>
                    <img
                        className={ `card-image skirmish-stronghold ${ this.props.cardSize }` }
                        src={ '/img/skirmish-images/skirmish-stronghold-' + this.getFaction(player) + '.jpg' }
                    />
                </div>
            );
        }

    }

    render() {

        if(this.props.isMe || this.props.spectating && !this.props.otherPlayer) {
            let shClass = 'player-stronghold-row our-side';
            if(this.props.thisPlayer && this.props.thisPlayer.imperialFavor) {
                shClass += ' favor';
            }
            return (
                <div className={ shClass }>
                    { this.props.thisPlayer && this.props.thisPlayer.role && this.props.thisPlayer.role.location ? <CardPile className='rolecard' source='role card' cards={ [this.props.thisPlayer.role] } topCard={ this.props.thisPlayer.role } disableMenu
                        onMouseOver={ this.props.onMouseOver } onMouseOut={ this.props.onMouseOut } onCardClick={ this.props.onCardClick } size={ this.props.cardSize } /> : <Placeholder size={ this.props.cardSize } /> }
                    { this.getStronghold(this.props.thisPlayer, this.props.isSkirmish) }
                    { this.getFavor(this.props.thisPlayer) }
                </div>
            );
        }
        let shClass = 'player-stronghold-row their-side';
        if(this.props.otherPlayer && this.props.otherPlayer.imperialFavor) {
            shClass += ' favor';
        }
        return (
            <div className={ shClass }>
                { this.getFavor(this.props.otherPlayer) }
                { this.getStronghold(this.props.otherPlayer, this.props.isSkirmish) }
                { this.props.otherPlayer && this.props.otherPlayer.role && this.props.otherPlayer.role.location ? <CardPile className='rolecard' source='role card' cards={ [this.props.otherPlayer.role] } topCard={ this.props.otherPlayer.role } disableMenu
                    onMouseOver={ this.props.onMouseOver } onMouseOut={ this.props.onMouseOut } onCardClick={ this.props.onCardClick } size={ this.props.cardSize } /> : <Placeholder size={ this.props.cardSize } /> }
            </div>
        );

    }
}

StrongholdRow.displayName = 'StrongholdRow';
StrongholdRow.propTypes = {
    cardSize: PropTypes.string,
    isMe: PropTypes.bool,
    isSkirmish: PropTypes.bool,
    onCardClick: PropTypes.func,
    onDragDrop: PropTypes.func,
    onMenuItemClick: PropTypes.func,
    onMouseOut: PropTypes.func,
    onMouseOver: PropTypes.func,
    otherPlayer: PropTypes.object,
    role: PropTypes.object,
    spectating: PropTypes.bool,
    strongholdProvinceCards: PropTypes.array,
    thisPlayer: PropTypes.object
};

export default StrongholdRow;
