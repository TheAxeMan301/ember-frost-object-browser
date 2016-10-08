import Ember from 'ember'

export default Ember.Route.extend({
  model: function () {
    return this.get('store').findAll('resource')
      .then((resources) => {
        return {
          model: dummyData.model,
          resources
        }
      })
  }
})
