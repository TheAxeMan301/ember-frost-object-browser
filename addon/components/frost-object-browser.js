import Ember from 'ember'
import layout from '../templates/components/frost-object-browser'
import FrostListMixin from 'ember-frost-list/mixins/frost-list-mixin'
import {generateFacetView} from 'ember-frost-bunsen/utils'
import computed from 'ember-computed-decorators'
import _ from 'lodash'

export default Ember.Component.extend(FrostListMixin, {
  layout,
  classNames: ['frost-object-browser'],

  init () {
    this._super(...arguments)

    console.log('object browser init')

    let initialState = _.cloneDeep(this.get('config').initialState || {})
    _.defaults(initialState, {
      sort: [],
      filter: {},
      expanded: false
    })
    this.set('currentState', initialState)
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

  selectedItemsNumber: Ember.computed('selectedItems', function () {
    return Object.keys(this.get('selectedItems')).length
  }),

  @computed('config')
  filterBunsenView (config) {
    return generateFacetView(config.filterBunsenFacets)
  },

  @computed('config', 'currentState')
  actionBarButtons (config, currentState) {
    let numSelected = currentState.selectedItems.length
    return _.map(config.actionBarButtons, (buttonSpec) => {
      let disabled = false
      switch (buttonSpec.enabled) {
        case 'always':
          disabled = false
          break
        case 'single':
          disabled = numSelected === 1
          break
        case 'multi':
          disabled = numSelected > 1
          break
        default:
          disabled = true
      }
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

    triggerAction () {
      this.notifications.addNotification({
        message: 'Action sent',
        type: 'success',
        autoClear: true,
        clearDuration: 2000
      })
    },

    triggerDelete () {
      this.notifications.addNotification({
        message: 'Delete Action fired',
        type: 'success',
        autoClear: true,
        clearDuration: 2000
      })
    },

    triggerEdit () {
      this.notifications.addNotification({
        message: 'Edit Action fired',
        type: 'success',
        autoClear: true,
        clearDuration: 2000
      })
    },

    triggerDetail () {
      this.notifications.addNotification({
        message: 'Detail Action fired',
        type: 'success',
        autoClear: true,
        clearDuration: 2000
      })
    },

    onFilterFormChange (formValue) {
      console.log('Filter changed:')
      console.log(formValue)
    }
  }
})
