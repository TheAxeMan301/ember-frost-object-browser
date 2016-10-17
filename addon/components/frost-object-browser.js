import Ember from 'ember'
import layout from '../templates/components/frost-object-browser'
import {generateFacetView, deemberify} from 'ember-frost-bunsen/utils'
import PreloadedDatamodel from '../datamodels/preloaded-datamodel'
import computed from 'ember-computed-decorators'
import _ from 'lodash'

export default Ember.Component.extend({
  layout,
  classNames: ['frost-object-browser'],

  // Raw list of data from data model
  itemsFromDatamodel: [],
  // Index in current data list to use for shift-click range
  selectionAnchor: null,

  init () {
    this._super(...arguments)

    console.log('object browser init')

    let currentState = _.cloneDeep(this.get('config').initialState || {})
    _.defaults(currentState, {
      sort: [],
      filter: {},
      expanded: false,
      selectedItems: {},
      expandedItems: {},
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
      let stateChanged = false
      if (_.keys(currentState.selectedItems).length > 0) {
        // We mutate the selectedItems map here. That changes state but is there any need to notify?
        let idToIndexMap = this.getIdToIndexMap(queryResult.data)
        let datamodel = this.get('datamodel')
        let selectedItemList = _.keys(currentState.selectedItems)
        for (let i = 0; i < selectedItemList.length; i++) {
          if (!(selectedItemList[i] in idToIndexMap)) {
            delete currentState.selectedItems[selectedItemList[i]]
            stateChanged = true
          }
        }
        if (stateChanged) {
          this.notifyPropertyChange('currentState')
        }
      }
      this.setProperties({
        filterCount: queryResult.filterCount,
        selectionAnchor: null,
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

  @computed('itemsFromDatamodel')
  idToIndexMap (itemsFromDataModel) {
    return this.getIdToIndexMap(itemsFromDataModel)
  },

  getIdToIndexMap (itemsFromDataModel) {
    let idMap = {}
    let datamodel = this.get('datamodel')
    for (let index = 0; index < itemsFromDataModel.length; index++) {
      idMap[datamodel.getId(itemsFromDataModel[index])] = index
    }
    return idMap
  },

  @computed('config', 'currentState', 'itemsFromDatamodel')
  itemsForList (config, currentState, itemsFromDatamodel) {
    let selectedItems = currentState.selectedItems
    let datamodel = this.get('datamodel')
    return _.map(itemsFromDatamodel, (record, index) => {
      let id = datamodel.getId(record)
      return {
        isSelected: id in selectedItems,
        isExpanded: false,
        record,
        index,
        onSelect: (event, model) => {
          this.onItemSelect(event, model)
        }
      }
    })
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
    let numSelected = _.keys(currentState.selectedItems).length
    return _.map(config.actionBarButtons || [], (buttonSpec) => {
      let disabled = false
      switch (buttonSpec.enabled) {
        case 'always':
          disabled = false
          break
        case 'multi':
          disabled = numSelected < 1
          break
        default:  // 'single'
          disabled = numSelected !== 1
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
      this.trigger(actionName)
    },

    onFilterFormChange (formValue) {
      this.get('currentState').filter = formValue
      this.notifyPropertyChange('currentState')
      this.populate()
    },

    onSortChange (newSort) {
      let pojoNewSort = deemberify(newSort)
      this.get('currentState').sort = _.map(pojoNewSort, (item) => {
        return _.pick(item, ['value', 'direction'])
      })
      this.notifyPropertyChange('currentState')
      this.changeContext()
      this.goToFirstPage()
      this.populate()
    },

    onItemSelect (event, itemModel) {
      let currentState = this.get('currentState')
      let selectedItems = currentState.selectedItems
      let datamodel = this.get('datamodel')
      let selectedId = datamodel.getId(itemModel.record)
      let newSelectionAnchor = null
      if (itemModel.isSelected) {
        delete selectedItems[selectedId]
      } else {
        let selectionAnchor = this.get('selectionAnchor')
        if (event.shiftKey && selectionAnchor !== null) {
          let itemList = this.get('itemsFromDatamodel')
          for (
            let i = Math.min(selectionAnchor, itemModel.index);
            i < Math.max(selectionAnchor, itemModel.index) + 1;
            i++
          ) {
            selectedItems[datamodel.getId(itemList[i])] = true
          }
        } else {
          if (!Ember.$(event.target).hasClass('frost-list-selection-indicator')) {
            selectedItems = {}
          }
          selectedItems[selectedId] = true
          newSelectionAnchor = itemModel.index
        }
      }
      this.set('selectionAnchor', newSelectionAnchor)
      currentState.selectedItems = selectedItems
      this.notifyPropertyChange('currentState')
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
