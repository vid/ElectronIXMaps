import React, { Component } from 'react';

export default class App extends Component {
    constructor() {
        super();

        document.title = 'IXMaps Client'
        this.state = { hasRun: false, result: 'Run a trace for a result.' };
    }

    render() {
        const { result, hasRun } = this.state;
        function runTrace() {
            fetch('http://localhost:2099/trace').then(res => {
                if (res.ok) {
                    res.text().then(text => {
                        this.setState({ result: JSON.stringify(text) });
                    });
                }
                this.setState({ hasRun: true });
            });
        }
        return (
            <div>
                <div><button onClick={runTrace.bind(this)}>Run a trace</button></div>
                {hasRun && <div>Result: <b>{result}</b></div>}
            </div>
        );
    }
}
