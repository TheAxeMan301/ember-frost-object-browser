import Ember from 'ember'
import layout from '../templates/components/frost-object-browser'
import {generateFacetView} from 'ember-frost-bunsen/utils'
import PreloadedDatamodel from '../datamodels/preloaded-datamodel'
import computed from 'ember-computed-decorators'
import _ from 'lodash'

export default Ember.Component.extend({
  layout,
  classNames: ['frost-object-browser'],

  itemsFromDatamodel: [],

  init () {
    this._super(...arguments)

    console.log('object browser init')

    let currentState = _.cloneDeep(this.get('config').initialState || {})
    _.defaults(currentState, {
      sort: [],
      filter: {},
      expanded: false,
      selectedItems: [],
      firstIndex: 0,
      numPages: 1,
      context: 0
    })
    this.setProperties({
      currentState,
      activeSorting: currentState.sort
    })

    this.setupDatamodel()
    this.populate()
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

  goToFirstPage () {
    let currentState = this.get('currentState')
    currentState.firstIndex = 0
    currentState.numPages = 1
    this.notifyPropertyChange('currentState')
  },

  changeContext () {
    let currentState = this.get('currentState')
    currentState.context += 1
    this.notifyPropertyChange('currentState')
  },

  populate () {
    let queryRequest = this.get('queryRequest')
    let datamodel = this.get('datamodel')
    datamodel.getData(queryRequest)
      .then((queryResult) => {
        this.handleQueryResult(queryResult)
      })
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

  @computed('config')
  listItemBunsenModel (config) {
    return config.listBunsenModel
  },

  @computed('config')
  listItemBunsenView (config) {
    return config.listBunsenView
  },

  @computed('config')
  expandable (config) {
    if (_.isUndefined(config.expandable)) {
      return Boolean(config.expandedListBunsenView)
    }
    return config.expandable
  },

  @computed('config')
  sortableProperties (config) {
    return config.sortProperties
  },

  @computed('config', 'currentState', 'itemsFromDatamodel')
  itemsForList (config, currentState, itemsFromDatamodel) {
    // TODO: manage selection and expansion
    return _.map(itemsFromDatamodel, (record) => {
      return {
        isSelected: false,
        isExpanded: false,
        record,
        onSelect: (event, model) => {
          this.onItemSelect(event, model)
        }
      }
    })
  },

  onItemSelect (event, model) {
    // event is jquery event and model is the full model passed to list item
    console.log('An item was clicked')
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
    onActionBarButtonClick (actionName) {
      console.log('actionBar button click')
      this.trigger(actionName)
    },

    onFilterFormChange (formValue) {
      console.log('Filter changed:')
      console.log(formValue)
      this.get('currentState').filter = formValue
      this.notifyPropertyChange('currentState')
    },

    onSortChange (newSort) {
      console.log('Sorting changed')
      this.get('currentState').sort = newSort.map((item) => {
        return _.pick(item, ['value', 'direction'])
      })
      this.notifyPropertyChange('currentState')
      this.changeContext()
      this.goToFirstPage()
      this.populate()
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
