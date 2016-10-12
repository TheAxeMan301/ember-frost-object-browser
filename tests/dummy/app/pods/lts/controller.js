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
      type: 'form',
      cells: [{
        model: 'alias'
      }, {
        model: 'id'
      }]
    },
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
    sorting: [{
      name: 'alias'
    }, {
      name: 'id'
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
      route: 'elsewhere',
      enabled: 'single'
    }],
    infoBar: {
      icon: {
        name: 'user-account',
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
  }
})
