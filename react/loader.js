/* Example:
<Loader type="halfcircle" width={60} height={60}/>
<Loader type="colorcircle" width={60} height={60}/>
<Loader type="roundcircle" color={true} width={60} height={60}/>
<Loader type="roundline" color={true} width={60} height={60}/>
<Loader type="bar" color={true} width={100} height={50}/>
<Loader type="ball" pos="static"/>
<Loader type="ball"/>
*/

import React from 'react';
import PropTypes from 'prop-types';
import './loader.css';

export default class Loader extends React.PureComponent {
    render() {
        let {type, color, style, pos} = this.props;
        type = type || 'roundcircle';
        let num = 6;
        let classes = `hi-loading-${type}`;
        if (type === 'bar') {
            classes = color
                ? `hi-loading-${type} hi-loading-rainbow`
                : `hi-loading-${type}`;
        } else if (type === 'roundcircle' || type === 'roundline') {
            num = 13;
            classes = color
                ? `hi-loading hi-loading-${type} hi-loading-resize`
                : `hi-loading hi-loading-${type}`;
        } else if (type === 'ball' && pos === 'static') {
            classes = `hi-loading-${type} hi-loading-static`;
        }
        let arr = new Array(num).join(0).split('');
        let styles = {
            ...style,
            width: this.props.width,
            height: this.props.height
        };
        return (
            <div className={classes} style={styles}>
                {arr.map((a, i) => <span key={i}></span>)}
            </div>
        );
    }
}
Loader.propTypes = {
    width: PropTypes.number,
    height: PropTypes.number
};
