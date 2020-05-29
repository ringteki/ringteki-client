import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { validateDeck } from 'ringteki-deck-helper';

import Input from '../Form/Input.jsx';
import Select from '../Form/Select.jsx';
import Typeahead from '../Form/Typeahead.jsx';
import TextArea from '../Form/TextArea.jsx';
import ApiStatus from '../Site/ApiStatus';
import * as actions from '../../actions';

//Old imports
import _ from 'underscore';
import $ from 'jquery';
import { findDOMNode } from 'react-dom';

class DeckEditor extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            cardList: '',
            conflictCards: [],
            deckName: 'New Deck',
            dynastyCards: [],
            faction: props.factions && props.factions['crab'],
            alliance: { name: '', value: '' },
            numberToAdd: 1,
            provinceCards: [],
            role: [],
            stronghold: [],
            validation: {
                deckname: '',
                cardToAdd: ''
            }
        };

        if(props.deck) {
            this.state.deckId = props.deck._id;
            this.state.deckName = props.deck.name;
            this.state.stronghold = props.deck.stronghold;
            this.state.role = props.deck.role;
            this.state.provinceCards = props.deck.provinceCards;
            this.state.conflictCards = props.deck.conflictCards;
            this.state.dynastyCards = props.deck.dynastyCards;
            this.state.faction = props.deck.faction;
            this.state.alliance = props.deck.alliance;
            this.state.status = props.deck.status;

            let cardList = '';
            for(const card of props.deck.stronghold) {
                cardList += this.formatCardListItem(card) + '\n';
            }

            for(const card of props.deck.role) {
                cardList += this.formatCardListItem(card) + '\n';
            }

            for(const card of props.deck.conflictCards) {
                cardList += this.formatCardListItem(card) + '\n';
            }

            for(const card of props.deck.dynastyCards) {
                cardList += this.formatCardListItem(card) + '\n';
            }

            for(const plot of props.deck.provinceCards) {
                cardList += this.formatCardListItem(plot) + '\n';
            }

            this.state.cardList = cardList;
        }
    }

    componentDidMount() {
        this.triggerDeckUpdated();
    }

    componentWillReceiveProps(props) {
        if(props.factions && !this.state.faction) {
            this.setState({ faction: props.factions['crab'] }, this.triggerDeckUpdated);
        }
    }

    getDeckFromState() {
        let deck = {
            _id: this.state.deckId,
            name: this.state.deckName,
            stronghold: this.state.stronghold,
            role: this.state.role,
            provinceCards: this.state.provinceCards,
            conflictCards: this.state.conflictCards,
            dynastyCards: this.state.dynastyCards,
            faction: this.state.faction,
            alliance: this.state.alliance
        };

        if(!this.props.restrictedList) {
            deck.status = {};
        } else {
            deck.status = validateDeck(deck, { packs: this.props.packs, restrictedList: this.props.restrictedList });
        }

        return deck;
    }

    triggerDeckUpdated() {
        const deck = this.getDeckFromState();

        if(this.props.onDeckUpdated) {
            this.props.onDeckUpdated(deck);
        }
    }

    formatCardListItem(card) {
        if(card.card.custom) {
            let typeCode = card.card.type;
            let typeName = typeCode[0].toUpperCase() + typeCode.slice(1);
            return card.count + ' Custom ' + typeName + ' - ' + card.card.name;
        }

        return card.count + ' ' + card.card.name;
    }

    onChange(field, event) {
        let state = this.state;

        state[field] = event.target.value;

        this.setState({ state }, this.triggerDeckUpdated);
    }

    onNumberToAddChange(event) {
        this.setState({ numberToAdd: event.target.value });
    }

    onFactionChange(selectedFaction) {
        this.setState({ faction: selectedFaction }, this.triggerDeckUpdated);
    }

    onAllianceChange(selectedAlliance) {
        let toUpdate = {
            alliance: selectedAlliance
        };

        this.setState(toUpdate, this.triggerDeckUpdated);                
    }

    addCardChange(selectedCards) {
        this.setState({ cardToAdd: selectedCards[0] });
    }

    onAddCard(event) {
        event.preventDefault();

        if(!this.state.cardToAdd || !this.state.cardToAdd.name) {
            return;
        }

        let cardList = this.state.cardList;
        cardList += `${this.state.numberToAdd}  ${this.state.cardToAdd.name}\n`;

        if(this.state.cardToAdd.type === 'province') {
            let provinces = this.state.provinceCards;
            this.addCard(provinces, this.state.cardToAdd, parseInt(this.state.numberToAdd));
            this.setState({ cardList: cardList, provinceCards: provinces }, this.triggerDeckUpdated);
        } else if(this.state.cardToAdd.side === 'dynasty') {
            let dynasty = this.state.dynastyCards;
            this.addCard(dynasty, this.state.cardToAdd, parseInt(this.state.numberToAdd));
            this.setState({ cardList: cardList, dynastyCards: dynasty }, this.triggerDeckUpdated);
        } else if(this.state.cardToAdd.side === 'conflict') {
            let conflict = this.state.conflictCards;
            this.addCard(conflict, this.state.cardToAdd, parseInt(this.state.numberToAdd));
            this.setState({ cardList: cardList, conflictCards: conflict }, this.triggerDeckUpdated);
        } else if(this.state.cardToAdd.type === 'stronghold') {
            let stronghold = this.state.stronghold;
            this.addCard(stronghold, this.state.cardToAdd, parseInt(this.state.numberToAdd));
            this.setState({ cardList: cardList, stronghold: stronghold }, this.triggerDeckUpdated);
        } else {
            let role = this.state.role;
            this.addCard(role, this.state.cardToAdd, parseInt(this.state.numberToAdd));
            this.setState({ cardList: cardList, role: role }, this.triggerDeckUpdated);
        }
    }

    onCardListChange(event) {
        let split = event.target.value.split('\n');
        let { deckName, faction, stronghold, role, provinceCards, conflictCards, dynastyCards } = this.state;

        stronghold = [];
        role = [];
        provinceCards = [];
        conflictCards = [];
        dynastyCards = [];

        for(const line of split) {
            let trimmedLine = line.trim();
            let index = 2;

            let num = parseInt(trimmedLine[0]);
            if(isNaN(num)) {
                continue;
            }

            if(line[1] === 'x') {
                index++;
            }

            let card = this.lookupCard(trimmedLine, index);
            if(card) {
                if(card.type === 'province') {
                    this.addCard(provinceCards, card, num);
                } else if(card.side === 'dynasty') {
                    this.addCard(dynastyCards, card, num);
                } else if(card.side === 'conflict') {
                    this.addCard(conflictCards, card, num);
                } else if(card.type === 'stronghold') {
                    this.addCard(stronghold, card, num);
                } else if(card.type === 'role') {
                    this.addCard(role, card, num);
                }
            }
        }

        this.setState({
            cardList: event.target.value,
            deckName: deckName,
            faction: faction,
            stronghold: stronghold,
            role: role,
            provinceCards: provinceCards,
            conflictCards: conflictCards,
            dynastyCards: dynastyCards
        }, this.triggerDeckUpdated);
    }

    lookupCard(line, index) {
        let packOffset = line.indexOf('(');
        let cardName = line.substr(index, packOffset === -1 ? line.length : packOffset - index - 1).trim();
        let packName = line.substr(packOffset + 1, line.length - packOffset - 2);

        if(cardName.startsWith('Custom ')) {
            return this.createCustomCard(cardName);
        }

        let pack = this.props.packs.find(pack => {
            return pack.name.toLowerCase() === packName.toLowerCase();
        });

        return Object.values(this.props.cards).find(card => {
            if(pack) {
                return card.name.toLowerCase() === cardName.toLowerCase() || card.name.toLowerCase() === (cardName + ' (' + pack.code + ')').toLowerCase();
            }

            return card.name.toLowerCase() === cardName.toLowerCase();
        });
    }

    addCard(list, card, number) {
        if(list[card.id]) {
            list[card.id].count += number;
        } else {
            list.push({ count: number, card: card });
        }
    }

    onSaveClick(event) {
        event.preventDefault();

        if(this.props.onDeckSave) {
            this.props.onDeckSave(this.getDeckFromState());
        }
    }

    onCancelClick() {
        this.props.navigate('/decks');
    }

    onImportDeckClick() {
        $(findDOMNode(this.refs.modal)).modal('show');
    }

    getCardListEntry(count, card) {
        let packName = '';
        let packId = '';
        if(card.pack_cards.length) {
            let packData = card.pack_cards[0];
            this.setState({ test: packData.pack.id });
            let pack = _.find(this.props.packs, p => p.id === packData.pack.id);
            if(pack && pack.name) {
                packName = ' (' + pack.name + ')';
                packId = ' (' + pack.id + ')';
            }
        }
        return count + ' ' + card.name + packName + '\n';
    }

    importDeck() {
        $(findDOMNode(this.refs.modal)).modal('hide');

        let importUrl = document.getElementById('importUrl').value;

        let apiUrl = 'https://api.fiveringsdb.com/';
        let strainPath = 'strains';
        let deckPath = 'decks';
        let deckResponse = {};

        let importId = String(importUrl).split('/')[4];
        let selector = String(importUrl).split('/')[3];

        let path = '';
        if(selector === 'decks') {
            path = deckPath;
        } else if(selector === 'strains') {
            path = strainPath;
        }

        $.ajax({
            type: 'GET',
            url: apiUrl + path + '/' + importId,
            dataType: 'json',
            async: false,
            success: function(data) {
                deckResponse = data;
            }
        });

        let deckClan = '';
        let deckFaction = '';
        let deckAlliance = '';
        let deckName = '';
        let deckList = '';
        let cardList = '';

        let stronghold = [];
        let role = [];
        let provinceCards = [];
        let conflictCards = [];
        let dynastyCards = [];

        if(deckResponse.success) {
            let deckRecord = deckResponse.record;
            if(selector === 'decks') {
                deckClan = deckRecord.primary_clan;
                deckAlliance = deckRecord.secondary_clan;
                deckName = deckRecord.name;
                deckList = deckRecord.cards;
            } else if(selector === 'strains') {
                deckClan = deckRecord.head.primary_clan;
                deckAlliance = deckRecord.head.secondary_clan;
                deckName = deckRecord.head.name;
                deckList = deckRecord.head.cards;
            }

            if(deckClan) {
                deckFaction = this.props.factions[deckClan];
            } else {
                deckFaction = this.props.factions['crab'];
            }

            if(deckAlliance) {
                deckAlliance = this.props.factions[deckAlliance];
            } else {
                deckAlliance = this.props.factions['crab'];
            }

            _.each(deckList, (count, id) => {
                cardList += this.getCardListEntry(count, this.props.cards[id]);
            });

            this.setState({
                cardList: cardList,
                deckName: deckName,
                faction: deckFaction,
                alliance: deckAlliance
            }, this.triggerDeckUpdated);
        }
    }

    render() {
        if(!this.props.factions || !this.props.cards) {
            return <div>Please wait while loading from the server...</div>;
        }

        let popup = (
            <div id='decks-modal' ref='modal' className='modal fade' tabIndex='-1' role='dialog'>
                <div className='modal-dialog' role='document'>
                    <div className='modal-content deck-popup'>
                        <div className='modal-header'>
                            <button type='button' className='close' data-dismiss='modal' aria-label='Close'><span aria-hidden='true'>×</span></button>
                            <h4 className='modal-title'>Provide Permalink</h4>
                        </div>
                        <div className='modal-body'>
                            <Input name='importUrl' fieldClass='col-sm-9' placeholder='Permalink' type='text' >
                                <div className='col-sm-1'>
                                    <button className='btn btn-default' onClick={ this.importDeck.bind(this) }>Import</button>
                                </div>
                            </Input>
                        </div>
                    </div>
                </div>
            </div>);

        return (
            <div>
                { popup }
                <ApiStatus apiState={ this.props.apiState } successMessage='Deck saved successfully.' />
                
                <div className='form-group'>
                    <div className='col-xs-12 deck-buttons'>
                        <span className='btn btn-primary' data-toggle='modal' data-target='#decks-modal'>Import deck</span>
                        <span className='col-xs-2'><button className='' ref='submit' type='submit' className='btn btn-primary' onClick={ this.onSaveClick.bind(this) }>Save</button></span>
                        <button ref='submit' type='button' className='btn btn-primary' onClick={ this.onCancelClick.bind(this) }>Cancel</button>
                    </div>
                </div>
               
                <h4>Either type the cards manually into the box below, add the cards one by one using the card box and autocomplete or for best results, copy the permalink url from <a href='http://fiveringsdb.com' target='_blank'>Five Rings DB</a> and paste it into the popup from clicking the "Import Deck" button.</h4>
                <form className='form form-horizontal'>
                    <Input name='deckName' label='Deck Name' labelClass='col-sm-3' fieldClass='col-sm-9' placeholder='Deck Name'
                        type='text' onChange={ this.onChange.bind(this, 'deckName') } value={ this.state.deckName } />
                    <Select name='faction' label='Clan' labelClass='col-sm-3' fieldClass='col-sm-9' options={ Object.values(this.props.factions) }
                        onChange={ this.onFactionChange.bind(this) } value={ this.state.faction ? this.state.faction.value : undefined } />
                    <Select name='alliance' label='Alliance' labelClass='col-sm-3' fieldClass='col-sm-9' options={ Object.values(this.props.alliances) }
                        onChange={ this.onAllianceChange.bind(this) } value={ this.state.alliance ? this.state.alliance.value : undefined }
                        valueKey='value' nameKey='name' blankOption={ { name: '- Select -', value: '' } } />

                    <Typeahead label='Card' labelClass={ 'col-sm-3 col-xs-2' } fieldClass='col-sm-4 col-xs-5' labelKey={ 'name' } options={ _.toArray(this.props.cards) }
                        onChange={ this.addCardChange.bind(this) }>
                        <Input name='numcards' type='text' label='Num' labelClass='col-xs-1 no-x-padding' fieldClass='col-xs-2'
                            value={ this.state.numberToAdd.toString() } onChange={ this.onNumberToAddChange.bind(this) } noGroup>
                            <div className='col-xs-1 no-x-padding'>
                                <button className='btn btn-primary' onClick={ this.onAddCard.bind(this) }>Add</button>
                            </div>
                        </Input>
                    </Typeahead>
                    <TextArea label='Cards' labelClass='col-sm-3' fieldClass='col-sm-9' rows='10' value={ this.state.cardList }
                        onChange={ this.onCardListChange.bind(this) } />
                    <div className='form-group'>
                        <div className='col-sm-offset-3 col-sm-8'>
                            <button ref='submit' type='submit' className='btn btn-primary' onClick={ this.onSaveClick.bind(this) }>Save</button>
                        </div>
                    </div>
                </form>
            </div>
        );
    }
}

DeckEditor.displayName = 'DeckEditor';
DeckEditor.propTypes = {
    alliances: PropTypes.object,
    cards: PropTypes.object,
    deck: PropTypes.object,
    factions: PropTypes.object,
    navigate: PropTypes.func,
    onDeckSave: PropTypes.func,
    onDeckUpdated: PropTypes.func,
    packs: PropTypes.array,
    restrictedList: PropTypes.array,
    updateDeck: PropTypes.func
};

function mapStateToProps(state) {
    return {
        alliances: state.cards.factions,
        cards: state.cards.cards,
        decks: state.cards.decks,
        factions: state.cards.factions,
        loading: state.api.loading,
        packs: state.cards.packs,
        restrictedList: state.cards.restrictedList
    };
}

export default connect(mapStateToProps, actions)(DeckEditor);
