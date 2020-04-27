// @flow

/**
 * AtlasKit components will deflect from appearance if css-reset is not present.
 */

import React, { Component } from 'react';
import { render } from 'react-dom';
// import { Provider } from 'react-redux';
// import { PersistGate } from 'redux-persist/integration/react';

import App from './features/app/App';
/**
 * Component encapsulating App component with redux store using provider.
 */
class Root extends Component {
    /**
     * Implements React's {@link Component#render()}.
     *
     * @returns {ReactElement}
     */
    render() {
        return (
            <App />
        );
    }
}

/**
 * Render the main / root application.
 *
 * $FlowFixMe.
 */
render(<Root />, document.getElementById('app'));
