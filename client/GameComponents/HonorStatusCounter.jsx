import React from 'react';
import PropTypes from 'prop-types';

import Counter from './Counter.jsx';

class HonorStatusCounter extends Counter {
    render() {
        var className = 'honorstatuscounter ' + this.props.name;

        if(this.props.cancel) {
            className += ' cancel';
        }

        if(this.props.fade) {
            className += ' fade-out';
        }

        let totalProps = 0;
        if(this.props.honored || this.props.dishonored) {
            totalProps++;
        }
        if(this.props.tainted) {
            totalProps++;
        }

        return (<div key={ this.props.name } className={ className }>
            { this.props.honored ? <img src='/img/honor-stone.png' title='Honored' alt='Honored' /> : null }
            { this.props.dishonored ? <img src='/img/dishonor-stone.png' title='Dishonored' alt='Dishonored' /> : null }
            { totalProps > 1 ? <div class='honorstatusspacer'/> : null }
            { this.props.tainted ? <img src='/img/tainted-stone-2.png' title='Tainted' alt='Tainted' /> : null }
        </div>);
    }
}

HonorStatusCounter.displayName = 'HonorStatusCounter';
HonorStatusCounter.propTypes = {
    cancel: PropTypes.bool,
    dishonored: PropTypes.bool,
    fade: PropTypes.bool,
    honored: PropTypes.bool,
    name: PropTypes.string.isRequired,
    shortName: PropTypes.string,
    value: PropTypes.number
};

export default HonorStatusCounter;
