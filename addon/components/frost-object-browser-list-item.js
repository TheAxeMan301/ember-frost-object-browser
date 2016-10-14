import Ember from 'ember'
import computed, {readOnly} from 'ember-computed-decorators'
import layout from '../templates/components/frost-object-browser-list-item'

export default Ember.Component.extend({
  layout,
  classNames: ['frost-list-item'],
  classNameBindings: [
    'isSelected',
    'isExpanded'
  ],

  @readOnly
  @computed('model.isSelected')
  isSelected (isSelected) {
    return isSelected
  },

  @readOnly
  @computed('model.isExpanded')
  isExpanded (isExpanded) {
    return isExpanded
  },

  onclick: Ember.on('click', function (event) {
    if (!(Ember.ViewUtils.isSimpleClick(event) || event.shiftKey || event.metaKey || event.ctrlKey)) {
      return true
    }

    event.preventDefault()
    event.stopPropagation()

    // We must use a different name to bypass frost-list's handling
    const onSelect = this.get('onSelectObjectBrowser')
    if (onSelect && typeof onSelect === 'function') {
      onSelect(event, this.get('model'))
    }
  })
})
