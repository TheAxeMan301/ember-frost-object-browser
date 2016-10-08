import Ember from 'ember'
import FrostListMixin from 'ember-frost-list/mixins/frost-list-mixin'

export default Ember.Controller.extend(FrostListMixin, {
  buttonPriority: Ember.computed('xxx', function () {
    return 'primary'
  }),
  nestedButtonPriority: Ember.computed('xxx', function () {
    return 'primary'
  }),
  
  fooList: ['a', 'b', 'c'],

  activeFacets: [],

  listConfig: {
    items: 'model.resources',
    sorting: {
      active: [{value: 'alias', direction: ':desc'}],

      properties: [
        {
          value: 'alias',
          label: 'Alias'
        },
        {
          value: 'id',
          label: 'Id'
        }
      ]
    }
  },

  selectedItemsNumber: Ember.computed('selectedItems', function () {
    return Object.keys(this.get('selectedItems')).length
  }),

  filteredItems: Ember.computed('model.resources', 'activeFacets', function () {
    let data = this.get('model.resources')
    let activeFacets = this.get('activeFacets')

    if (!Ember.isPresent(activeFacets)) {
      return data
    }

    return data.filter((data) => {
      let key = true
      activeFacets.forEach((facet) => {
        if (data.get(facet.id).indexOf(facet.value) === -1) {
          key = false
        }
      })
      return key
    })
  }),

  bunsenModel: {
    type: 'object',
    properties: {
      id: {
        type: 'string'
      },
      alias: {
        type: 'string'
      }
    }
  },

  bunsenView: {
    version: '1.0',
    type: 'form',
    'rootContainers': [{
      label: 'Main',
      container: 'main'
    }],
    containers: [{
      id: 'main',
      rows: [[{
        model: 'id',
        label: 'element Id'
      }], [{
        model: 'alias'
      }]
      ]
    }]
  },

  actions: {
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
      let activeFacets = []
      const keys = Object.keys(formValue)
      keys.forEach((key) => {
        activeFacets.pushObject({
          id: key,
          value: formValue[key]
        })
      })
      console.log(activeFacets)
      this.set('activeFacets', activeFacets)
    }
  }
})
