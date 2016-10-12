import Ember from 'ember'
import layout from '../templates/components/frost-object-browser'
import {generateFacetView} from 'ember-frost-bunsen/utils'
import PreloadedDatamodel from '../datamodels/preloaded-datamodel'
import computed from 'ember-computed-decorators'
import _ from 'lodash'

export default Ember.Component.extend({
  layout,
  classNames: ['frost-object-browser'],

  itemsFromDataModel: [],

  init () {
    this._super(...arguments)

    console.log('object browser init')

    let initialState = _.cloneDeep(this.get('config').initialState || {})
    _.defaults(initialState, {
      sort: [],
      filter: {},
      expanded: false,
      selectedItems: [],
      firstIndex: 0,
      numPages: 1,
      context: 0
    })
    this.set('currentState', initialState)

    this.setupDatamodel()
  },

  setupDatamodel () {
    let datamodelConfig = this.get('config').dataAdapter || {}
    let datamodel
    if (datamodelConfig.type === 'custom') {
      datamodel = this.get('customDatamodel')
    } else if (datamodelConfig.type === 'ember-data') {
      // TODO: get an ember data datamodel
      datamodel = PreloadedDatamodel.create()
    } else {  // default is 'preloaded'
      datamodel = PreloadedDatamodel.create()
    }
    datamodel.configure(this)
    this.set('datamodel', datamodel)
  },

  @computed('currentState', 'pageSize')
  queryRequest (currentState, pageSize) {
    return _.assign(_.pick(currentState, [
      'sort',
      'filter',
      'firstIndex',
      'numPages',
      'context'
    ]), {
      pageSize
    })
  },

  populate () {
    let queryRequest = this.get('queryRequest')
    let datamodel = this.get('datamodel')
    datamodel.getData(queryRequest).then(this.handleQueryResult)
  },

  handleQueryResult (queryResult) {
    let currentState = this.get('currentState')
    if (queryResult.context === currentState.context) {
      this.setProperties({
        filterCount: queryResult.filterCount,
        itemsFromDatamodel: queryResult.data
      })
    }
  },

  @computed('config', 'currentState', 'datamodelItems')
  listConfig (config, currentState, datamodelItems) {
    let properties = _.map(config.sorting || [], (sortDef) => {
      return {
        value: sortDef.name,
        label: sortDef.label || sortDef.name
      }
    })
    return {
      items: datamodelItems,
      sorting: {
        active: currentState.sort,
        properties
      }
    }
  },

  @computed('config')
  listItemBunsenModel (config) {
    return config.listBunsenModel
  },

  @computed('config')
  listItemBunsenView (config) {
    return config.listBunsenView
  },

  @computed('config')
  filterBunsenModel (config) {
    return config.filterBunsenModel
  },

  @computed('config')
  filterBunsenView (config) {
    return generateFacetView(config.filterBunsenFacets)
  },

  @computed('config')
  pageSize (config) {
    return config.pageSize || 100
  },

  @computed('config', 'currentState')
  actionBarButtons (config, currentState) {
    let numSelected = currentState.selectedItems.length
    return _.map(config.actionBarButtons || [], (buttonSpec) => {
      let disabled = false
      switch (buttonSpec.enabled) {
        case 'always':
          disabled = false
          break
        case 'multi':
          disabled = numSelected > 1
          break
        default:  // 'single'
          disabled = numSelected === 1
      }
      return _.defaults({}, buttonSpec, {
        priority: 'secondary',
        size: 'medium',
        disabled
      })
    })
  },

  @computed('config', 'currentState')
  actionBarLinks (config, currentState) {
    let numSelected = currentState.selectedItems.length
    return _.map(config.actionBarLinks || [], (linkSpec) => {
      let disabled = false
      switch (linkSpec.enabled) {
        case 'always':
          disabled = false
          break
        case 'multi':
          disabled = numSelected > 1
          break
        default:  // 'single'
          disabled = numSelected === 1
      }
      return _.defaults({}, linkSpec, {
        text: linkSpec.route,
        disabled
      })
    })
  },

  actions: {
    onCreate () {
      this.notifications.addNotification({
        message: 'Create Action fired',
        type: 'success',
        autoClear: true,
        clearDuration: 2000
      })
    },

    onActionBarButtonClick (actionName) {
      console.log('actionBar button click')
      this.trigger(actionName)
    },

    onFilterFormChange (formValue) {
      console.log('Filter changed:')
      console.log(formValue)
      this.get('currentState').filter = formValue
    },

    onSortChange (newSort) {
      console.log('Sorting changed')
      this.get('currentState').sort = newSort.map((item) => {
        return _.pick(item, ['value', 'direction'])
      })
    },

    onSelectionChange (selectChangeInfo) {
      console.log('Selection has changed')
    },

    onCollapseAll () {
      console.log('collapse all')
    },

    onExpandAll () {
      console.log('expand all')
    },

    onCollapse () {
      console.log('collapse')
    },

    onExpand () {
      console.log('expand')
    }
  }
})
