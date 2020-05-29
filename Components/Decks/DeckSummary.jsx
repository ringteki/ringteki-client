import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import _ from 'underscore';

import DeckStatus from './DeckStatus.jsx';

//TODO Update from throneteki
class DeckSummary extends React.Component {
    constructor() {
        super();

        this.onCardMouseOut = this.onCardMouseOut.bind(this);
        this.onCardMouseOver = this.onCardMouseOver.bind(this);

        this.state = {
            cardToShow: ''
        };
    }

    hasTrait(card, trait) {
        return card.traits.some(t => t.toLowerCase() === trait.toLowerCase());
    }

    onCardMouseOver(event) {
        let cardToDisplay = Object.values(this.props.cards).filter(card => {
            return event.target.innerText === card.label;
        });

        this.setState({ cardToShow: cardToDisplay[0] });
    }

    onCardMouseOut() {
        this.setState({ cardToShow: undefined });
    }

    getCardsToRender() {
        let cardsToRender = [];
        let groupedCards = {};
        let combinedCards = _.union(this.props.deck.stronghold, this.props.deck.role, this.props.deck.provinceCards, this.props.deck.dynastyCards, this.props.deck.conflictCards);

        for(const card of combinedCards) {
            let typeCode = card.card.type;
            let side = '';

            if(!typeCode) {
                continue;
            }

            let type = typeCode[0].toUpperCase() + typeCode.slice(1);
            
            if(typeof card.card.side !== 'undefined') {
                let sideCode = card.card.side;
                side = sideCode[0].toUpperCase() + sideCode.slice(1);
            }

            if(type === 'Character' || type === 'Event') {
                type = side + ' ' + type;
            }

            if(!groupedCards[type]) {
                groupedCards[type] = [card];
            } else {
                groupedCards[type].push(card);
            }
        }

        for(const [key, cardList] of Object.entries(groupedCards)) {
            let cards = [];
            let count = 0;
            let index = 0;

            for(const card of cardList) {
                cards.push(<div key={ `${card.card.code}${index++}` }><span>{ card.count + 'x ' }</span><span className='card-link' onMouseOver={ this.onCardMouseOver } onMouseOut={ this.onCardMouseOut }>{ card.card.name }</span></div>);
                count += parseInt(card.count);
            }

            cardsToRender.push(
                <div className='cards-no-break' key={ key }>
                    <div className='card-group-title'>{ key + ' (' + count.toString() + ')' }</div>
                    <div key={ key } className='card-group'>{ cards }</div>
                </div>);
        }

        return cardsToRender;
    }

    render() {
        if(!this.props.deck || !this.props.cards) {
            return <div>Waiting for selected deck...</div>;
        }

        let cardsToRender = this.getCardsToRender();

        return (
            <div className='deck-summary col-xs-12'>
                { this.state.cardToShow ? <img className='hover-image' src={ '/img/cards/' + this.state.cardToShow.id + '.jpg' } /> : null }
                
                <div className='decklist'>
                    <div className='col-xs-2 col-sm-3 no-x-padding'>{ this.props.deck.faction ? <img className='deck-mon img-responsive' src={ '/img/mons/' + this.props.deck.faction.value + '.png' } /> : null }</div>
                    <div className='col-xs-8 col-sm-6'>
                        <div className='info-row row'><span>Clan:</span>{ this.props.deck.faction ? <span className={ 'pull-right' }>{ this.props.deck.faction.name }</span> : null }</div>
                        <div className='info-row row' ref='alliance'><span>Alliance:</span>{ this.props.deck.alliance && this.props.deck.alliance.name ? <span className='pull-right'>{ this.props.deck.alliance.name }</span> : <span> None </span> }</div>
                        <div className='info-row row' ref='provinceCount'><span>Province deck:</span><span className='pull-right'>{ this.props.deck.status.provinceCount } cards</span></div>
                        <div className='info-row row' ref='dynastyDrawCount'><span>Dynasty Deck:</span><span className='pull-right'>{ this.props.deck.status.dynastyCount } cards</span></div>
                        <div className='info-row row' ref='conflictDrawCount'><span>Conflict Deck:</span><span className='pull-right'>{ this.props.deck.status.conflictCount } cards</span></div>
                        <div className='info-row row'><span>Validity:</span>
                            <DeckStatus className='pull-right' status={ this.props.deck.status } />
                        </div>
                    </div>
                    <div className='col-xs-2 col-sm-3 no-x-padding'>{ this.props.deck.alliance && this.props.deck.alliance.value !== 'none' ? <img className='deck-alliance-mon img-responsive' src={ '/img/mons/' + this.props.deck.alliance.value + '.png' } /> : null }</div>
                </div>
                <div className='col-xs-12 no-x-padding'>
                    <div className='cards'>
                        { cardsToRender }
                    </div>
                </div>
            </div>);
    }
}

DeckSummary.displayName = 'DeckSummary';
DeckSummary.propTypes = {
    cards: PropTypes.object,
    deck: PropTypes.object
};

export default DeckSummary;
