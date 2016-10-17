import Ember from 'ember'
import BaseDatamodel from './base-datamodel'
import _ from 'lodash/lodash'
import {deemberify} from 'ember-frost-bunsen/utils'
import computed from 'ember-computed-decorators'

/**
 * Data model for data that is preloaded or externally managed.
 * If the data attribute is updated then it will manage the subscription.
 */

export default BaseDatamodel.extend({
  items: [], // This will be the actual data

  /**
   * A filter that simply does an ===
   * @param {Object} filterObject Object describing the filter
   * @returns {Function} filter function
   */
  getEqualsFilter (filterObject) {
    let filterValue = filterObject.value
    let key = filterObject.key
    return function (item) {
      return item[key] === filterValue
    }
  },

  /**
   * String search is always case insensitive
   * @param {Object} filterObject Object describing the filter
   * @returns {Function} filter function
   */
  getStringFilter (filterObject) {
    // _.toLower() is forgiving and convenient
    let searchString = _.toLower(filterObject.value)
    let key = filterObject.key
    if (filterObject.match) {
      return function (item) {
        return _.toLower(item[key]) === searchString
      }
    }
    return function (item) {
      return _.toLower(item[key]).indexOf(searchString) >= 0
    }
  },

  getAndFilter (filterObject) {
    let filterFuncs = _.map(filterObject.filters, (subFilterObject) => {
      return this.getFilterFunc(subFilterObject)
    })
    return function (item) {
      for (let i = 0; i < filterFuncs.length; i++) {
        if (!filterFuncs[i](item)) {
          return false
        }
      }
      return true
    }
  },

  getOrFilter (filterObject) {
    let filterFuncs = _.map(filterObject.filters, (subFilterObject) => {
      return this.getFilterFunc(subFilterObject)
    })
    return function (item) {
      for (let i = 0; i < filterFuncs.length; i++) {
        if (filterFuncs[i](item)) {
          return true
        }
      }
      return false
    }
  },

  getFilterFunc (filterObject) {
    let supportedFilters = this.get('supportedFilters')
    if (filterObject && filterObject.type in supportedFilters) {
      return this[supportedFilters[filterObject.type]](filterObject)
    }
    return function (/* item */) {
      return true
    }
  },

  /**
   * Convert the filterObject that comes from the facets form into a spec that describes the filtering
   * explicitly. Matches each field a filter type that can be configured in the datamodel section of the config.
   * @param filterObject
   * @returns {{type: string, filters: Array}}
   */
  getFilterSpec (filterObject) {
    let filters = []
    let filterTypes = this.get('filterTypes')
    _.forEach(filterObject, (value, key) => {
      filters.push({
        type: filterTypes[key] || 'string',
        value,
        key
      })
    })
    return {
      type: 'and',
      filters
    }
  },

  /**
   * The function here creates the filter function from a filter object
   * Custom filters can be added here.
   */
  supportedFilters: {
    string: 'getStringFilter',
    equals: 'getEqualsFilter',
    and: 'getAndFilter',
    or: 'getOrFilter'
  },

  /**
   * Simplest sort type: the value is its key
   * @param {Object} sortObject Object describing the sort
   * @returns {Function} Function for sorting that returns sort key
   */
  getDefaultSortFunc (sortObject) {
    let key = sortObject.value
    let descending = sortObject.direction === ':desc'
    return function (itemA, itemB) {
      let valA = itemA[0][key]
      let valB = itemB[0][key]
      if (valA < valB) {
        return descending ? 1 : -1
      } else if (valA > valB) {
        return descending ? -1 : 1
      }
      // Stabilize with index check
      return itemA[1] - itemB[1]
    }
  },

  /**
   * String sort is case insensitive
   * @param {Object} sortObject Object describing the sort
   * @returns {Function} Function for sorting that returns sort key
   */
  getStringSortFunc (sortObject) {
    let key = sortObject.value
    let descending = sortObject.direction === ':desc'
    return function (itemA, itemB) {
      let valA = _.toLower(itemA[0][key])
      let valB = _.toLower(itemB[0][key])
      if (valA < valB) {
        return descending ? 1 : -1
      } else if (valA > valB) {
        return descending ? -1 : 1
      }
      // Stabilize with index check
      return itemA[1] - itemB[1]
    }
  },

  /**
   * Number sort treats everything as a number
   * @param {Object} sortObject Object describing the sort
   * @returns {Function} Function for sorting that returns sort key
   */
  getNumberSortFunc (sortObject) {
    let key = sortObject.value
    let descending = sortObject.direction === ':desc'
    return function (itemA, itemB) {
      let valA = parseFloat(itemA[0][key])
      valA = _.isNaN(valA) ? 0 : valA
      let valB = parseFloat(itemB[0][key])
      valB = _.isNaN(valB) ? 0 : valB
      if (valA < valB) {
        return descending ? 1 : -1
      } else if (valA > valB) {
        return descending ? -1 : 1
      }
      // Stabilize with index check
      return itemA[1] - itemB[1]
    }
  },

  /**
   * A map of sort types to sort function getters.
   * The sort function itself should return a key value.
   */
  supportedSorts: {
    default: 'getDefaultSortFunc',
    string: 'getStringSortFunc',
    number: 'getNumberSortFunc'
  },

  doSorting (data, sortDefList) {
    let sortData = _.map(data, (item, index) => {
      return [item, index]
    })
    let supportedSorts = this.get('supportedSorts')
    let sortTypes = this.get('sortTypes')
    sortDefList.reverse()
    for (let i = 0; i < sortDefList.length; i++) {
      let sortType = sortTypes[sortDefList[i].value] || 'default'
      let sortFunc = this.get(supportedSorts[sortType])(sortDefList[i])
      sortData.sort(sortFunc)
    }
    sortDefList.reverse()
    return _.map(sortData, (item) => {
      return item[0]
    })
  },

  @computed('items')
  deemberifiedItems (items) {
    let pojoArray = items
    if (Ember.typeOf(items.toArray) === 'function') {
      pojoArray = items.toArray()
    }
    return _.map(pojoArray, (item) => {
      return deemberify(item)
    })
  },

  getData (dataQuery) {
    let fullData = this.get('deemberifiedItems')
    let filterSpec = this.getFilterSpec(dataQuery.filter)
    let filterFunc = this.getFilterFunc(filterSpec)
    let filteredData = fullData.filter(filterFunc)
    let sortedData = this.doSorting(filteredData, dataQuery.sort)
    let pagedData = sortedData.slice(
      dataQuery.firstIndex, dataQuery.firstIndex + dataQuery.numPages * dataQuery.pageSize)
    return Ember.RSVP.resolve({
      data: pagedData,
      filterCount: sortedData.length,
      firstIndex: dataQuery.firstIndex,
      context: dataQuery.context
    })
  },

  /**
   * Configure the data model. Object browser passes a ref to itself
   */
  configure (objectBrowser) {
    let datamodelConfig = objectBrowser.get('config').dataAdapter || {}
    let itemsProp = datamodelConfig.itemsProp || 'items'
    let sortTypes = datamodelConfig.sortTypes || {}
    let filterTypes = datamodelConfig.filterTypes || {}

    objectBrowser.addObserver(itemsProp, this, 'itemsObserver')

    this.setProperties({
      items: objectBrowser.get(itemsProp),
      objectBrowser,
      itemsProp,
      sortTypes,
      filterTypes
    })
  },

  destroy () {
    this.get('objectBrowser').removeObserver(this.get('itemsProp'), this, 'itemsObserver')
  },

  itemsObserver (objectBrowser, key) {
    this.set('items', objectBrowser.get(key))
    this.dataHasChanged()
  }
})
