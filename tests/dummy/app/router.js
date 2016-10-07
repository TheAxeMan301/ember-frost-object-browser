import Ember from 'ember'
import config from './config/environment'

var Router = Ember.Router.extend({
  location: config.locationType
})

Router.map(function () {
  this.route('menu', {path: '/'})
  this.route('lts')
  this.route('custom-components')
  this.route('datamodel')
})

export default Router
