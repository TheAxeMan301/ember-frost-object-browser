import Ember from 'ember'
import config from './config/environment'

var Router = Ember.Router.extend({
  location: config.locationType
})

Router.map(function () {
  this.route('lts')
  this.route('menu', {path: '/'})
  this.route('datamodel')
})

export default Router
