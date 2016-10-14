import Ember from 'ember'

export default Ember.Controller.extend({
  objectBrowserConfig: {
    listBunsenModel: {
      type: 'object',
      properties: {
        alias: {
          type: 'string'
        },
        id: {
          type: 'string'
        }
      }
    },
    listBunsenView: {
      version: '2.0',
      type: 'detail',
      cells: [{
        children: [{
          classNames: {
            cell: 'small',
            value: 'ob-input',
            label: 'ob-label'
          },
          model: 'alias'
        }, {
          classNames: {
            cell: 'small',
            value: 'ob-input',
            label: 'ob-label'
          },
          model: 'id'
        }]
      }]
    },
    expandable: true,
    filterBunsenModel: {
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
    // This gets sent to bunsen util generateFacetView()
    filterBunsenFacets: [{
      model: 'id'
    }, {
      model: 'alias'
    }],
    sortProperties: [{
      value: 'alias',
      label: 'Alias'
    }, {
      value: 'id',
      label: 'Id'
    }],
    actionBarButtons: [{
      actionName: 'onEdit',
      text: 'Edit',
      enabled: 'single'
    }, {
      actionName: 'onDelete',
      text: 'Delete',
      priority: 'tertiary',
      enabled: 'multi'
    }],
    actionBarLinks: [{
      text: 'Go elsewhere',
      route: 'lts',
      enabled: 'single'
    }],
    infoBar: {
      icon: {
        name: 'user',
        pack: 'frost'
      },
      title: 'User Accounts',
      subTitle: 'List of users',
      actionButtons: [{
        actionName: 'onCreate',
        icon: {
          name: 'create'
        },
        text: 'Create',
        enabled: 'always'
      }]
    },
    initialState: {
      sort: [{
        value: 'alias',
        direction: ':desc'
      }],
      filter: {
      },
      expanded: false
    },
    dataAdapter: {
      type: 'preloaded',    // The default, can be left out
      itemsProp: 'items'    // Also a default
      // If we were loading from API virtually we would have info on how to link up meta data and do paging
    }
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
    onEdit () {
      this.notifications.addNotification({
        message: 'Edit Action fired',
        type: 'success',
        autoClear: true,
        clearDuration: 2000
      })
    },
    onDelete () {
      this.notifications.addNotification({
        message: 'Delete Action fired',
        type: 'success',
        autoClear: true,
        clearDuration: 2000
      })
    }
  }
})
