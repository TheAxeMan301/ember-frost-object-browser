import Ember from 'ember'
import BaseDatamodel from 'datamodels/base-datamodel'
import _ from 'lodash/lodash'

/**
 * Data model for data that is preloaded or externally managed.
 * If the data attribute is updated then it will manage the subscription.
 */

export default BaseDatamodel.extend({
  data: [], // This will be the actual data
  // TODO: observe it and tie to subscription

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
    let searchString = filterObject.value.toLowerCase()
    let key = filterObject.key
    if (filterObject.match) {
      return function (item) {
        return item[key].toString().toLowerCase() === searchString
      }
    }
    return function (item) {
      return item[key].toString().toLowerCase().indexOf(searchString) >= 0
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
      return supportedFilters[filterObject.type](filterObject)
    }
    return function (/* item */) {
      return true
    }
  },

  /**
   * The function here creates the filter function from a filter object
   * Custom filters can be added here.
   */
  supportedFilters: {
    string: this.getStringFilter,
    equals: this.getEqualsFilter,
    and: this.getAndFilter,
    or: this.getOrFilter
  },

  /**
   * Simplest sort type: the value is its key
   * @param {Object} sortObject Object describing the sort
   * @returns {Function} Function for sorting that returns sort key
   */
  getDefaultSortFunc (sortObject) {
    let key = sortObject.key
    let descending = sortObject.descending
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
    let key = sortObject.key
    let descending = sortObject.descending
    return function (itemA, itemB) {
      let valA = itemA[0][key].toString().toLowerCase()
      let valB = itemB[0][key].toString().toLowerCase()
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
    let key = sortObject.key
    let descending = sortObject.descending
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
    default: this.getDefaultSort,
    string: this.getStringSort,
    number: this.getNumberSort
  },

  doSorting (data, sortDefList) {
    let sortData = _.map(data, (item, index) => {
      return [item, index]
    })
    let supportedSorts = this.get('supportedSorts')
    sortDefList.reverse()
    for (let i = 0; i < sortDefList.length; i++) {
      let sortFunc = supportedSorts[sortDefList[i].type](sortDefList[i])
      sortData.sort(sortFunc)
    }
    sortDefList.reverse()
    return _.map(sortData, (item) => {
      return item[0]
    })
  },

  getData (dataQuery) {
    let fullData = this.get('data')
    let filterFunc = this.getFilterFunc(dataQuery.filter)
    let filteredData = fullData.filter(filterFunc)
    let sortedData = this.doSorting(filteredData, dataQuery.sortDefs)
    let pagedData = filteredData.slice(dataQuery.firstIndex, dataQuery.firstIndex + dataQuery.count)
    return Ember.RSVP.resolve({
      data: pagedData,
      filterCount: sortedData.length,
      firstIndex: dataQuery.firstIndex,
      context: dataQuery.context
    })
  }
})
