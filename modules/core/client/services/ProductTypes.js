angular.module('core').service('Types', function () {
  return {
    1: {productTypeId: 1, name: 'Wine', similarNames: 'w,wines'},
    2: {productTypeId: 2, name: 'Beer', similarNames: 'b,beers,ale,lager'},
    3: {productTypeId: 3, name: 'Spirits', similarNames: 's,spirit,liqueur'},
    12: {productTypeId: 12, name: 'Generic', similarNames: 'generic,undefined,unknown'},
    15: {productTypeId: 15, name: 'Cocktails', similarNames: 'cocktails,cocktail'},
    16: {productTypeId: 16, name: 'Art', similarNames: 'art'},
    17: {productTypeId: 17, name: 'Health', similarNames: 'health,vitamins,supplements'}
  }
})
