import React from 'react';
import PropTypes from 'prop-types';
import AsyncSelect from 'react-select/async';
import './index.css';

class GeoAutocomplete extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            error: false,
            errorMsg: '',
            query: this.props.query ? this.props.query : '',
            queryResults: [],
            publicKey: this.props.publicKey,
            resetSearch: this.props.resetSearch ? this.props.resetSearch : false,
            placeholder: this.props.placeholder
        };
        this._resetSearch = this._resetSearch.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.loadOptions = this.loadOptions.bind(this);
    }

    _resetSearch() {
        console.log("reseting search")
        if(this.state.resetSearch) {
            this.setState({
            query: '',
            queryResults: []
            });
        } else {
            this.setState({ queryResults: [] });
        }
    }
    loadOptions(e){
        //console.log("query from inside loadOptions", this.state.query)
        return new Promise((resolve,reject) => {
            const header = { 'Content-Type': 'application/json' };
            let path = 'https://api.mapbox.com/geocoding/v5/mapbox.places/' + this.state.query + '.json?access_token=' + this.state.publicKey;
        
            if(this.props.country) {
              path = 'https://api.mapbox.com/geocoding/v5/mapbox.places/' + this.state.query + '.json?access_token=' + this.state.publicKey + '&country=' + this.props.country;
            }
            if(this.state.query.length > 2) {
                fetch(path, { headers: header,})
                .then(res => {
                    if (!res.ok) throw Error(res.statusText);
                        return res.json()
                }).then(json => {
                    this.setState({
                        error: false,
                        queryResults: json.features.map(x => ({...x, label: x.place_name}))
                    }); //, console.log(this.state.queryResults)
                    resolve(json.features.map(x => ({...x, label: x.place_name})))
                }).catch(err => {
                    this.setState({
                      error: true,
                      errorMsg: 'There was a problem retrieving data...',
                      queryResults: []
                    });
                    reject(err)
                  })
                } else {
                  this.setState({
                    error: false,
                    queryResults: []
                  });
                }
        });
    }
    handleInputChange(e){
        //console.log(e)
        this.setState({query: e}, console.log(this.state.query))
    }
    handleChange(event){
        if(this.state.resetSearch === false && event) {
            this.setState({ query: event.place_name });
        }
        if (event){
            this.props.onSuggestionSelect(
                event.place_name,
                event.center[1],
                event.center[0],
                event.text
            )
        }
    }
    render() {
        console.log("q: ", this.state.query)
        return (
            <div className="geo-autocomplete">
                <AsyncSelect
                    isClearable
                    isDisabled={this.props.disabled}
                    inputValue={this.state.query ? this.state.query : this.props.showValue}
                    value={this.props.showValue}
                    autoBlur
                    blurInputOnSelect
                    //placeholder={this.state.placeholder}
                    // Fire the api here and get results async
                    loadOptions={this.loadOptions}
                    //just updates the state
                    onInputChange={this.handleInputChange} 
                    onChange={this.handleChange}
                    components={
                        {
                        DropdownIndicator: () => null,
                        IndicatorSeparator: () => null,
                        NoOptionsMessage: () => <div>Start typing a destination</div>
                        }
                    }
                />
            {this.state.error && <div className="ac-suggestion">{this.state.errorMsg}</div>}
            </div>
        );
    }
}

GeoAutocomplete.defaultProps = {
    inputId: null,
    inputOnFocus: null,
    inputOnBlur: null,
    inputOnClick: null
  };
  
  GeoAutocomplete.propTypes = {
    inputId: PropTypes.string,
    inputOnFocus: PropTypes.func,
    inputOnBlur: PropTypes.func,
    inputOnClick: PropTypes.func,
    inputClass: PropTypes.string,
    publicKey: PropTypes.string.isRequired,
    placeholder: PropTypes.string,
    onSuggestionSelect: PropTypes.func.isRequired,
    country: PropTypes.string,
    query: PropTypes.string,
    resetSearch: PropTypes.bool
  }


export default GeoAutocomplete;