import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  Button, Container, Text, Segment,
} from 'native-base';
import { FlatList, View, StyleSheet } from 'react-native';
import moment from 'moment';
import 'moment/locale/hu';
import MultiSelect from 'react-native-multiple-select';

import { Spacer } from '../../components/UI';
import SingleItem from '../../components/Covid/SingleItem';
import numberWithCommas from '../../lib/number';
import { getCountryTranslation } from '../../lib/countries';

const styles = StyleSheet.create({
  segmentButton: {
    flex: 1,
    justifyContent: 'center',
  },
  globalBox: {
    padding: 20,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  globalHeading: {
    marginBottom: 20,
    fontWeight: '400',
    fontSize: 20,
    color: 'white',
  },
  globalValue: {
    color: 'white',
    fontWeight: '700',
    fontSize: 30,
  },
  globalPercent: {
    color: 'white',
    fontWeight: '600',
    fontSize: 22,
  },
});

class CovidDataListContainer extends Component {
  constructor(props) {
    super(props);
    const { ownCountries, countries } = props;
    // const selectedCountries = countries.filter((item) => ownCountries.includes(item.country));

    this.state = {
      tab: 'own-list',
      error: null,
      loading: false,
      selectedCountries: ownCountries,
    };

    this._multiSelect = React.createRef();
  }

  componentDidMount = () => {
    this.fetchData().then(() => {
      const { ownCountries } = this.props;
      this.setState({ selectedCountries: ownCountries });
    });
  };

  /**
   * Fetch Data
   */
  fetchData = async ({ forceSync = false } = {}) => {
    const { fetchData } = this.props;

    this.setState({ loading: true, error: null });

    try {
      await fetchData({ forceSync });
      this.setState({ loading: false, error: null });
    } catch (err) {
      this.setState({ loading: false, error: err.message });
    }
  };

  changeTab = (tab) => {
    this.setState({ tab });
  };

  renderCountriesTab = () => {
    const { countries, fetchData } = this.props;
    const { loading } = this.state;
    return (
      <FlatList
        data={countries}
        onRefresh={() => fetchData(true)}
        refreshing={loading}
        renderItem={({ item }) => <SingleItem item={item} />}
        keyExtractor={(item, index) => index.toString()}
        listFooterComponent={() => (
          <React.Fragment>
            <Spacer size={20} />
            <Button
              block
              bordered
              onPress={() => fetchData(true)}
            >
              <Text>Frissítés</Text>
            </Button>
          </React.Fragment>
        )}
      />
    );
  };

  onSelectedItemsChanged = (selectedItems) => {
    this.setState({ selectedCountries: selectedItems });
  };

  renderOwnList = () => {
    const { countries, fetchData } = this.props;
    const { loading, selectedCountries } = this.state;
    // console.log(this._multiSelect);
    const countriesCopy = [...countries];
    const sortedCountries = countriesCopy.sort((a, b) => ((a.country > b.country) ? 1 : -1));
    // eslint-disable-next-line array-callback-return
    sortedCountries.map((c) => {
      c.hu = getCountryTranslation(c.country);
    });
    const selectableCountries = sortedCountries.filter((c) => c.country !== 'Hungary');
    // eslint-disable-next-line max-len
    const selectedCountriesFlatlist = countriesCopy.filter((item) => selectedCountries.includes(item.country));
    // console.log(selectedCountriesFlatlist);
    return (
      <View>
        <MultiSelect
          hideTags
          items={selectableCountries}
          notFoundText="Ilyen elem nem található."
          selectedText="kiválasztva"
          closeText="OK"
          uniqueKey="country"
          displayKey="hu"
          ref={(c) => { this._multiSelect = c; }}
          onSelectedItemsChange={this.onSelectedItemsChanged}
          selectedItems={selectedCountries}
          selectText="Ország hozzáadása"
          searchInputPlaceholderText="Kezdjen el gépelni egy országot..."
          fixedHeight
          fontSize={16}
          itemFontSize={16}
          hideSubmitButton
          selectedItemTextColor="green"
          selectedItemFontWeight="700"
          textInputProps={{ autoFocus: false }}
          // searchInputStyle={{ backgroundColor: 'red' }}
          styleMainWrapper={{ marginTop: 10 }}
          styleItemsContainer={{
            backgroundColor: '#eee',
            paddingBottom: 5,
            marginBottom: 20,
            borderBottomLeftRadius: 5,
            borderBottomRightRadius: 5,
          }}
          styleListContainer={{ paddingVertical: 10, marginBottom: 20 }}
          styleTextDropdown={{ color: 'black', paddingHorizontal: 20, fontWeight: '600' }}
          styleTextDropdownSelected={{ color: '#039dfc', paddingHorizontal: 20, fontWeight: '600' }}
        />
        {/* eslint-disable-next-line no-prototype-builtins */}
        {(this._multiSelect && this._multiSelect.hasOwnProperty('current') && this._multiSelect.current) && (
          <View>
            {this._multiSelect.getSelectedItemsExt(selectedCountries)}
          </View>
        )}
        <FlatList
          data={selectedCountriesFlatlist}
          onRefresh={() => fetchData(true)}
          refreshing={loading}
          renderItem={({ item, index }) => (
            <SingleItem
              alwaysOpen={index === 0}
              opened={index === 0}
              item={item}
            />
          )}
          keyExtractor={(item, index) => index.toString()}
          listFooterComponent={() => (
            <React.Fragment>
              <Spacer size={20} />
              <Button
                block
                bordered
                onPress={() => fetchData(true)}
              >
                <Text>Frissítés</Text>
              </Button>
            </React.Fragment>
          )}
        />
      </View>
    );
  };

  renderGlobal = () => {
    const { global } = this.props;
    const deathRate = global.deaths / global.cases * 100;
    const recoveredRate = global.recovered / global.cases * 100;
    return (
      <View style={{ paddingTop: 10 }}>
        <View style={{
          ...styles.globalBox,
          backgroundColor: '#039dfc',
        }}
        >
          <Text style={styles.globalHeading}>
            Fertőzött esetek:
          </Text>
          <Text style={styles.globalValue}>
            {/* eslint-disable-next-line react/prop-types */}
            {numberWithCommas(global.cases)}
          </Text>
        </View>
        <View style={{
          ...styles.globalBox,
          backgroundColor: 'red',
        }}
        >
          <Text style={styles.globalHeading}>
            Elhunytak száma:
          </Text>
          <Text style={styles.globalValue}>
            {/* eslint-disable-next-line react/prop-types */}
            {numberWithCommas(global.deaths)}
          </Text>
          <Text style={styles.globalPercent}>
            {deathRate.toFixed(2)}
            %
          </Text>
        </View>
        <View style={{
          ...styles.globalBox,
          backgroundColor: 'green',
        }}
        >
          <Text style={styles.globalHeading}>
            Felépültek száma:
          </Text>
          <Text style={styles.globalValue}>
            {/* eslint-disable-next-line react/prop-types */}
            {numberWithCommas(global.recovered)}
          </Text>
          <Text style={styles.globalPercent}>
            {recoveredRate.toFixed(2)}
            %
          </Text>
        </View>
      </View>
    );
  };

  renderTab = (tab) => {
    switch (tab) {
      case 'own-list':
        return this.renderOwnList();
      case 'countries':
        return this.renderCountriesTab();
      case 'global':
        return this.renderGlobal();
      default:
        return this.renderOwnList();
    }
  };

  /**
   * Render
   */
  render = () => {
    const { lastSync } = this.props;
    const { error, tab } = this.state;
    moment.locale('hu');
    const lastUpdated = moment(lastSync).fromNow();
    return (
      <React.Fragment>
        <Segment style={{ backgroundColor: 'white', width: '100%', paddingHorizontal: 10 }}>
          <Button
            style={styles.segmentButton}
            first
            active={tab === 'own-list'}
            onPress={() => this.changeTab('own-list')}
          >
            <Text>Saját lista</Text>
          </Button>
          <Button
            style={styles.segmentButton}
            active={tab === 'countries'}
            onPress={() => this.changeTab('countries')}
          >
            <Text>Országok</Text>
          </Button>
          <Button
            style={styles.segmentButton}
            active={tab === 'global'}
            onPress={() => this.changeTab('global')}
            last
          >
            <Text>Összesített</Text>
          </Button>
        </Segment>
        <Container style={{ padding: 10, paddingTop: 0 }}>
          <View style={{
            paddingVertical: 5,
            paddingHorizontal: 20,
            backgroundColor: 'rgba(0,0,0,0.15)',
            borderRadius: 3,
          }}
          >
            {error && <Text style={{ fontSize: 12, color: 'red' }}>{error}</Text>}
            <Text style={{ fontSize: 12 }}>
              Adatbázis frissítésre legutóbb:
              {' '}
              {lastUpdated}
            </Text>
          </View>
          {this.renderTab(tab)}
          <Spacer size={20} />
        </Container>
      </React.Fragment>
    );
  };
}

CovidDataListContainer.propTypes = {
  countries: PropTypes.arrayOf(PropTypes.object).isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  global: PropTypes.object.isRequired,
  fetchData: PropTypes.func.isRequired,
  ownCountries: PropTypes.arrayOf(PropTypes.string).isRequired,
  lastSync: PropTypes.string,
};

CovidDataListContainer.defaultProps = {
  lastSync: null,
};

const mapStateToProps = (state) => ({
  countries: state.coviddata.countries || [],
  global: state.coviddata.global || {},
  lastSync: state.coviddata.lastSync || '',
  ownCountries: state.settings.ownCountries || ['Hungary'],
});

const mapDispatchToProps = (dispatch) => ({
  fetchData: dispatch.coviddata.fetchList,
});

export default connect(mapStateToProps, mapDispatchToProps)(CovidDataListContainer);
