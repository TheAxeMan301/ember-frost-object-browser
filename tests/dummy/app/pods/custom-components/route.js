import Ember from 'ember'
import dummyData from '../mocks/dummyInput'

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
