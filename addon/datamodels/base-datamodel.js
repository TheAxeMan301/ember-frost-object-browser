import Ember from 'ember'

/**
 * A base version of the data model for an object browser
 * If it is actually used it will always represent an empty list.
 * All necessary public methods used by object browser are present though.
 */

export default Ember.Object.extend({
  /**
   * The object browser gets its data with this method.
   * @param {Object} dataQuery dataQuery object
   * @returns {Promise} Promise that resolves with query result
   */
  getData (dataQuery) {
    return Ember.RSVP.resolve({
      data: [],
      filterCount: 0,
      firstIndex: 0,
      context: dataQuery.context
    })
  },

  /**
   * Object browser calls this when its state changes.
   * The query may not matter to some data sources.
   * In other cases it could be used to limit the scope of some backend connection.
   * An overriding class could also check the scope of changes itself before sending it to the callback.
   * @param {Object} dataQuery Data query that describes the data change scope of interest
   * @param {Function} callback Callback that gets called on subscription changes
   */
  subscribe (dataQuery, callback) {
    this.set('subscriptionQuery', dataQuery)
    this.set('subscriptionCallback', callback)
  },

  /**
   * Object browser calls this on exiting in case any cleanup needs to be done.
   */
  unsubscribe () {
    this.set('subscriptionQuery', undefined)
    this.set('subscriptionCallback', undefined)
  },

  /**
   * Helper for subscription functionality.
   * Not called by object browser directly, but can
   * be used by extending classes for convenience.
   * If a queryResult is supplied then it is passed to the subscriptionCallback.
   * Otherwise it will use the current subscriptionQuery to get the data.
   * @param {Object} queryResult Optional query result.
   */
  dataHasChanged (queryResult) {
    let dataQuery = this.get('subscriptionQuery')
    // If the data is out of context then do nothing
    if (dataQuery && queryResult && dataQuery.context !== queryResult.context) {
      return
    }
    let callback = this.get('subscriptionCallback')
    if (callback) {
      if (queryResult) {
        callback(queryResult)
      } else {
        this.getData(dataQuery)
          .then(callback)
      }
    }
  },

  /**
   * Configure the data model. Object browser passes a ref to itself.
   */
  configure (/* object-browser */) {
  }
})
