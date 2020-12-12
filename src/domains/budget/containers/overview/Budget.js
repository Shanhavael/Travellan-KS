import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { LineChart } from 'react-native-chart-kit';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import Card from 'components/card/Card';
import HeaderButton from 'components/headerButton/HeaderButton';
import * as budgetActions from 'state/budget/budgetActions';
import * as handlers from 'budget/handlers/PrepareData';
import * as categories from 'budget/models/Categories';
import { budgetStyle as styles } from './BudgetStyle';
import Colors from 'constants/Colors';

const screenWidth = Dimensions.get('window').width;

const Budget = (props) => {
  const dispatch = useDispatch();
  const tripId = props.route.params.tripId;
  const selectedTrip = useSelector((state) =>
    state.trips.availableTrips.find((item) => item.id === tripId),
  );
  const budget = selectedTrip.budget;

  const [selectedCurrency, setSelectedCurrency] = useState(
    selectedTrip.budget === undefined ? undefined : selectedTrip.budget[0],
  );

  const [displayableValue, setDisplayableValue] = useState(
    selectedCurrency ? selectedCurrency.value : null,
  );

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [amountIsValid, setAmountIsValid] = useState(false);
  const [category, setCategory] = useState('general');
  const [account, setAccount] = useState(
    selectedCurrency ? selectedCurrency.defaultAccount : 'card',
  );
  const [error, setError] = useState();
  const [isLoading, setIsLoading] = useState();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState(
    selectedCurrency ? selectedCurrency.history[0] : null,
  );

  const data = {
    labels: selectedCurrency
      ? handlers.prepareLabelsForLC(selectedCurrency.history)
      : [],
    datasets: [
      {
        data: selectedCurrency
          ? handlers.prepareDataForLC(selectedCurrency.history)
          : [],
        color: (opacity = 1) => `rgba(255, 140, 0, ${opacity})`,
        strokeWidth: 2,
      },
    ],
    legend: ['Budget value'],
  };

  const chartConfig = {
    backgroundGradientFrom: Colors.cards,
    backgroundGradientFromOpacity: 0.0,
    backgroundGradientTo: Colors.cards,
    backgroundGradientToOpacity: 0.9,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
  };

  const clear = () => {
    setTitle('');
    setAmount('');
  };

  const chooseCategory = (iconPressed) => {
    setCategory(
      Object.keys(categories.categoryIcons).find(
        (key) => categories.categoryIcons[key] === iconPressed,
      ),
    );
  };

  let amountRegex = new RegExp('^\\d+(( \\d+)*|(,\\d+)*)(.\\d+)?$');
  const amountChangeHandler = (text) => {
    text.trim().length === 0 || !amountRegex.test(text)
      ? setAmountIsValid(false)
      : setAmountIsValid(true);
    setAmount(text);
  };

  const modifyAmount = (typeOfOperation) => {
    if (title && amount && amountIsValid) {
      const changedCurrency = selectedCurrency;

      if (typeOfOperation === 'plus') {
        setDisplayableValue(
          displayableValue + Math.abs(handlers.prepareValue(amount)),
        );

        changedCurrency.value =
          changedCurrency.value + Math.abs(handlers.prepareValue(amount));

        changedCurrency.history.push({
          id: changedCurrency.history.length + 1,
          title: title,
          value: Math.abs(handlers.prepareValue(amount)),
          category: category,
          account: account,
          date: new Date(),
        });

        persistBudget();
      } else if (typeOfOperation === 'minus') {
        setDisplayableValue(
          displayableValue + -Math.abs(handlers.prepareValue(amount)),
        );

        changedCurrency.value =
          changedCurrency.value - Math.abs(handlers.prepareValue(amount));

        changedCurrency.history.push({
          id: changedCurrency.history.length + 1,
          title: title,
          value: -Math.abs(handlers.prepareValue(amount)),
          category: category,
          account: account,
          date: new Date(),
        });

        persistBudget();
      } else {
        setError('Something went wrong...');
      }

      const index = budget.findIndex((item) => item.id === selectedCurrency.id);
      budget[index] = changedCurrency;

      clear();
    } else {
      setError('Enter correct amount and title.');
    }
  };

  const deleteCurrency = useCallback(
    async (id) => {
      setIsRefreshing(true);

      const filteredActiveCurrencies = budget.filter((item) => item.id !== id);

      await dispatch(
        budgetActions.updateBudget(tripId, filteredActiveCurrencies),
      ).then(() => loadBudget());

      budget !== undefined
        ? setSelectedCurrency(filteredActiveCurrencies[0])
        : setSelectedCurrency(null);

      setIsRefreshing(false);
    },
    [budget, dispatch, loadBudget, tripId],
  );

  const persistBudget = useCallback(async () => {
    setError(null);
    setIsLoading(true);
    try {
      await dispatch(budgetActions.updateBudget(tripId, budget));
    } catch (err) {
      setError(err.message);
    }
    setIsLoading(false);
  }, [budget, dispatch, tripId]);

  const loadBudget = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await dispatch(budgetActions.fetchBudget(tripId));
    } catch (err) {
      setError(err.message);
    }
    setIsRefreshing(false);
  }, [dispatch, setIsRefreshing, tripId]);

  useEffect(() => {
    setIsLoading(true);
    loadBudget().then(() => {
      setIsLoading(false);
    });
  }, [dispatch, loadBudget]);

  if (isLoading || isRefreshing) {
    return (
      <View style={[styles.centered, {backgroundColor: Colors.background}]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (budget === [] || budget === undefined) {
    return (
      <View style={styles.contentContainer}>
        <View style={styles.budgetlessContainer}>
          <Text style={[styles.text, styles.budgetlessText]}>
            There is no budget to show!
          </Text>
          <Text style={[styles.text, styles.budgetlessText]}>
            Create a currency card with the
          </Text>
          <Icon name="wallet-plus" size={32} style={[styles.text, {margin: 10}]} />
          <Text style={[styles.text, styles.budgetlessText]}>sign above!</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.contentContainer}>
      <View style={styles.currenciesContainer}>
        <FlatList
          horizontal
          data={budget}
          ItemSeparatorComponent={() => <View style={{width: 7}} />}
          renderItem={({item}) => (
            <TouchableOpacity
              style={styles.currencyHolder}
              onLongPress={() => {
                Alert.alert(
                  'Are you sure?',
                  'Delete currency.',
                  [
                    {
                      text: 'Cancel',
                      style: 'cancel',
                    },
                    {
                      text: 'Delete',
                      onPress: () => {
                        deleteCurrency(item.id);
                      },
                    },
                  ],
                  {cancelable: true},
                );
              }}
              onPress={() => {
                setSelectedCurrency(item);
                setDisplayableValue(item.value);
                setTitle('');
                setAmount('');
                setAccount(item.defaultAccount);
              }}>
              {!!selectedCurrency && (
                <Text
                  style={
                    selectedCurrency.currency === item.currency
                      ? styles.currencyActive
                      : styles.currencyNonactive
                  }>
                  {item.currency}
                </Text>
              )}
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id.toString()}
        />
      </View>

      {selectedCurrency !== undefined && (
        <View style={styles.overviewContainer}>
          <View style={styles.center}>
            <Text style={{color: Colors.grey}}>Cash</Text>
            <View style={styles.accounts}>
              <Icon name="cash" style={[styles.icon, styles.text]} />
              <Text
                style={[
                  styles.label,
                  handlers.calculateCash(selectedCurrency.history) < 0
                    ? styles.negative
                    : styles.positive,
                ]}>
                {handlers.calculateCash(selectedCurrency.history)}
              </Text>
            </View>
          </View>

          <View style={styles.center}>
            <Text style={{color: Colors.grey}}>General balance</Text>
            <Text
              style={[
                styles.icon,
                displayableValue < 0 ? styles.negative : styles.positive,
              ]}>
              {displayableValue < 0 ? '-' : '+'}
              {displayableValue}
            </Text>
          </View>

          <View style={styles.center}>
            <Text style={{color: Colors.grey}}>Card</Text>
            <View style={[styles.accounts]}>
              <Icon name="credit-card" style={[styles.icon, styles.text]} />
              <Text
                style={[
                  styles.label,
                  handlers.calculateCard(selectedCurrency.history) < 0
                    ? styles.negative
                    : styles.positive,
                ]}>
                {handlers.calculateCard(selectedCurrency.history)}
              </Text>
            </View>
          </View>
        </View>
      )}
      {selectedCurrency !== undefined && (
        <ScrollView contentContainerStyle={styles.detailsContainer}>
          {selectedCurrency.history.length > 1 && (
            <View>
              <View style={[styles.smallMarginTop, styles.chartContainer]}>
                <LineChart
                  data={data}
                  width={screenWidth * 0.9}
                  height={220}
                  chartConfig={chartConfig}
                  fromZero={true}
                  onDataPointClick={(item) =>
                    setSelectedHistoryItem(selectedCurrency.history[item.index])
                  }
                  getDotColor={(item, index) =>
                    selectedCurrency.history[index].value < 0
                      ? '#b20000'
                      : 'green'
                  }
                />
              </View>
              {!!selectedHistoryItem && (
                <View
                  style={[
                    styles.smallMarginTop,
                    {
                      backgroundColor:
                        selectedHistoryItem.value < 0 ? '#b20000' : 'green',
                      padding: 15,
                      borderRadius: 20,
                    },
                  ]}>
                  <Text style={styles.text}>
                    {new Date(selectedHistoryItem.date).toLocaleDateString()}
                  </Text>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}>
                    <Text style={[styles.text, {fontSize: 22}]}>
                      {selectedHistoryItem.value}
                    </Text>
                    <Text style={[styles.text]}>
                      {selectedHistoryItem.title}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          )}
          <View style={styles.smallMarginTop}>
            <Card style={{padding: '5%'}}>
              <Text style={[styles.text, styles.label]}>Operations</Text>
            </Card>
            <View style={{padding: '5%'}}>
              <View>
                <Text style={{color: 'grey'}}>Categories</Text>
                <View
                  style={[
                    styles.categoriesContainer,
                    styles.extraSmallMarginTop,
                  ]}>
                  {categories.icons.map((item) => (
                    <TouchableOpacity
                      style={[styles.iconButton]}
                      onPress={() => chooseCategory(item)}>
                      <Icon
                        name={item}
                        style={[
                          styles.icon,
                          categories.categoryIcons[category] === item
                            ? styles.activeCategory
                            : styles.nonactiveCategory,
                        ]}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
                <View style={styles.center}>
                  <Text style={[styles.activeCategory]}>
                    {categories.categoryLabels[category].toString()}
                  </Text>
                </View>
              </View>
              <View style={{marginVertical: '5%'}}>
                <Text style={{color: 'grey'}}>Accounts</Text>
                <View style={[styles.extraSmallMarginTop, styles.justifyRow]}>
                  <View>
                    <TouchableOpacity
                      style={[styles.justifyRow, {alignItems: 'center'}]}
                      onPress={() => setAccount('cash')}>
                      <Icon
                        name="cash"
                        style={[
                          {marginRight: '5%'},
                          styles.icon,
                          account === 'cash'
                            ? styles.activeCategory
                            : styles.nonactiveCategory,
                        ]}
                      />
                      <Text
                        style={[
                          styles.label,
                          account === 'cash'
                            ? styles.activeCategory
                            : styles.nonactiveCategory,
                        ]}>
                        Cash
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <View style={{marginLeft: '5%'}}>
                    <TouchableOpacity
                      style={[styles.justifyRow, {alignItems: 'center'}]}
                      onPress={() => setAccount('card')}>
                      <Icon
                        name="credit-card"
                        style={[
                          {marginRight: '5%'},
                          styles.icon,
                          account === 'card'
                            ? styles.activeCategory
                            : styles.nonactiveCategory,
                        ]}
                      />
                      <Text
                        style={[
                          styles.label,
                          account === 'card'
                            ? styles.activeCategory
                            : styles.nonactiveCategory,
                        ]}>
                        Card
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
              <View style={styles.extraSmallMarginTop}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter title"
                  placeholderTextColor="grey"
                  value={title}
                  onChangeText={(text) => setTitle(text)}
                />
              </View>
              <View>
                <TextInput
                  style={styles.input}
                  placeholder="Enter amount"
                  placeholderTextColor="grey"
                  value={amount}
                  onChangeText={(number) => amountChangeHandler(number)}
                  keyboardType="numeric"
                />
                <View style={[styles.justifyRow, styles.actions]}>
                  <TouchableOpacity onPress={() => modifyAmount('plus')}>
                    <Icon
                      style={[
                        styles.icon,
                        styles.positive,
                        {marginRight: '3%'},
                      ]}
                      name="plus"
                    />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => modifyAmount('minus')}>
                    <Icon style={[styles.icon, styles.negative]} name="minus" />
                  </TouchableOpacity>
                </View>
              </View>
              {!!error && (
                <View style={styles.errorContainer}>
                  <Text style={styles.error}>{error}</Text>
                </View>
              )}
            </View>
          </View>
          <View style={styles.smallMarginTop}>
            <Card style={{padding: '5%'}}>
              <Text style={[styles.text, styles.label]}>History</Text>
            </Card>
            {!selectedCurrency.history.length ? (
              <View style={styles.smallMarginTop}>
                <Text style={styles.text}>No operations to show</Text>
              </View>
            ) : (
              selectedCurrency.history
                .slice(0)
                .reverse()
                .map((item) => (
                  <Card style={styles.operationCard}>
                    <View style={styles.justifyRow}>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'center',
                          alignItems: 'center',
                          marginRight: '5%',
                        }}>
                        <Icon
                          name={categories.categoryIcons[item.category]}
                          style={[
                            styles.icon,
                            styles.text,
                            {marginRight: '10%'},
                          ]}
                        />
                        <Icon
                          name={
                            item.account === 'card' ? 'credit-card' : 'cash'
                          }
                          style={[styles.icon, styles.text]}
                        />
                      </View>
                      <View>
                        <Text style={styles.date}>
                          {new Date(item.date).toLocaleDateString()} at{' '}
                          {new Date(item.date).toLocaleTimeString()}
                        </Text>
                        <View style={[styles.justifyRow]}>
                          <Text
                            style={
                              item.value < 0 ? styles.negative : styles.positive
                            }>
                            {item.value}
                            {'   '}
                          </Text>
                          <Text style={styles.text}>{item.title}</Text>
                        </View>
                      </View>
                    </View>
                  </Card>
                ))
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
};

export const budgetOptions = (navData) => {
  return {
    headerRight: () => (
      <HeaderButtons HeaderButtonComponent={HeaderButton}>
        <Item
          title="Create a trip"
          iconName="wallet-plus"
          onPress={() => {
            navData.navigation.navigate('Add currency', {
              tripId: navData.route.params.tripId,
            });
          }}
        />
      </HeaderButtons>
    ),
  };
};

export default Budget;
