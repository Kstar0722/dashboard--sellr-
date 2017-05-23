angular.module('core').service('Types', function () {
  return {
    1: {productTypeId: 1, name: 'Wine', similarNames: 'w,wines', sizes: ['750 ml', '1.5 L']},
    2: {productTypeId: 2, name: 'Beer', similarNames: 'b,beers,ale,lager', sizes: ['12 oz bottle', '12 oz can', '4-pack bottles', '4-pack cans', '6-pack bottles', '6-pack cans', '12-pack bottles', '12-pack cans', '24-pack bottles', '24-pack cans', '750 ml']},
    3: {productTypeId: 3, name: 'Spirits', similarNames: 's,spirit,liqueur', sizes: ['375 ml', '700 ml', '750 ml', '1.75 L']},
    12: {productTypeId: 12, name: 'Generic', similarNames: 'generic,undefined,unknown', sizes: []},
    15: {productTypeId: 15, name: 'Cocktails', similarNames: 'cocktails,cocktail', sizes: []},
    16: {productTypeId: 16, name: 'Art', similarNames: 'art', sizes: []},
    17: {productTypeId: 17, name: 'Health', similarNames: 'health,vitamins,supplements', sizes: []}
  }
})
