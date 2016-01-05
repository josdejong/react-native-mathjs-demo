/**
 * Simple Calculator App
 * Powered by math.js
 */
'use strict';

let React = require('react-native');
let {
    AppRegistry,
    Dimensions,
    DeviceEventEmitter,
    ListView,
    StyleSheet,
    ScrollView,
    Text,
    TextInput,
    TouchableHighlight,
    View,
} = React;

let math = require('mathjs');

math.config({
  number: 'bignumber'
});

let MARGIN = 20;
let PRECISION = 14; // formatting precision

let scope = {};

/**
 * Generate a new numeric id
 * @return {number}
 */
function getId () {
  return ++id;
}
let id = 0;

function evaluate (expression) {
  let id = getId();
  try {
    let result = math.format(math.eval(expression, scope), PRECISION);
    return {id, expression, result};
  }
  catch (error) {
    return {id, expression, error};
  }
}

let Calculator = React.createClass({
  getInitialState: function () {
    let history = [
      evaluate('1.2 * (2 + 4.5)'),
      evaluate('5.08 cm to inch'),
      evaluate('sin(45 deg) ^ 2'),
      evaluate('3/2 + 4i'),
      evaluate('det([-1, 2; 3, 1])')
    ];

    return {
      expression: '',
      history: history,
      dataSource: new ListView.DataSource({
        rowHasChanged: (r1, r2) => r1 !== r2}
      ).cloneWithRows(history),

      visibleHeight: this.getWindowHeight(),
      visibleTop: 0
    }
  },

  render: function() {
    return (
      <View style={{height: this.state.visibleHeight, top: this.state.visibleTop}}>

        <ScrollView
            ref="scrollView"
            automaticallyAdjustContentInsets={false}
            style={styles.scrollView}>

          <Text style={styles.information}>
            Enter your expressions in the text field below.
            Here some example expressions to get the idea:
          </Text>

          <ListView
              dataSource={this.state.dataSource}
              renderRow={this.renderResult}
              style={styles.history} />

        </ScrollView>

        <View style={styles.inputBar}>
          <View style={{flex: 1}} >
            <TextInput
                ref="input"
                autoCorrect={false}
                enablesReturnKeyAutomatically={true}
                style={styles.inputExpr}
                onChangeText={(expression) => this.setState({expression})}
                onSubmitEditing={this.handleEvaluate}
                value={this.state.expression} />
          </View>

          <View style={{flex: 0, alignItems: 'center'}} >
            <TouchableHighlight
                underlayColor="white"
                style={styles.evalTouchable}
                onPress={this.handleEvaluate} >
              <View style={styles.evalButton}>
                <Text style={styles.evalButtonText}>=</Text>
              </View>
            </TouchableHighlight>
            </View>
        </View>

      </View>
    );
  },


  /**
   * Render an items from history
   * @param {{id: number, expression: string, result: string | undefined, error: Error | undefined}} entry
   */
  renderResult: function (entry) {
    let result = entry.error
        ? <Text style={styles.error}>{entry.error.toString()}</Text>
        : <Text style={styles.result}>{entry.result}</Text>;

    return <View key={entry.id} style={styles.historyItem}>
      <Text style={styles.expression}>{entry.expression}</Text>
      {result}
    </View>;
  },

  componentDidMount: function () {
    // set focus to expression input box
    this.refs.input.focus();

    // listen to events keyboard will show/hide, and resize the window then.
    DeviceEventEmitter.addListener('keyboardDidShow', this.keyboardDidShow);
    DeviceEventEmitter.addListener('keyboardDidHide', this.keyboardDidHide);
  },

  handleEvaluate: function () {
    let expression = this.state.expression;
    if (expression.trim() !== '') {
      let history = this.state.history.concat([
        evaluate(this.state.expression)
      ]);

      this.setState({
        expression: '',
        history,
        dataSource: this.state.dataSource.cloneWithRows(history)
      });

      this.scrollDown();

      this.refs.input.focus();
    }
  },

  keyboardDidShow: function (event) {
    let keyboardHeight = event.endCoordinates.height;

    this.setState({
      visibleHeight: (this.getWindowHeight() - keyboardHeight),
      visibleTop: keyboardHeight - MARGIN / 2
    });

    this.scrollDown();
  },

  keyboardDidHide: function (event) {
    this.setState({
      visibleHeight: this.getWindowHeight(),
      visibleTop: 0
    });
  },

  // scroll to the bottom on the next tick when the new entry
  // is added to the list with results
  scrollDown: function () {
    setTimeout(() => {
      this.refs.scrollView.scrollTo(1e99);
    }, 0);
  },

  getWindowHeight: function () {
    return Dimensions.get('window').height - MARGIN;
  }

});

let styles = StyleSheet.create({

  container: {
    flex: 1
  },

  scrollView: {
    flex: 1,
    marginHorizontal: 5
  },

  inputBar: {
    flex: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5
  },

  inputExpr: {
  },

  evalTouchable: {
  },

  evalButton: {
    backgroundColor: '#ee422e',
    paddingVertical: 5,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 2
  },

  evalButtonText: {
    fontSize: 24,
    color: '#ffffff'
  },

  history: {
  },

  information: {
    fontStyle: 'italic'
  },

  historyItem: {
    marginVertical: 5
  },

  expression: {
    color: 'black'
  },

  result: {
    color: 'gray',
    marginLeft: 20
  },

  error: {
    color: '#ee422e',
    marginLeft: 20
  }
});

AppRegistry.registerComponent('Calculator', () => Calculator);
