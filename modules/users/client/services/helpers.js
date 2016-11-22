(function (_) {
  'use strict';

  _.mixin({
    removeItem: function (arr, item) {
      return _.replaceItem(arr, item, undefined);
    },
    replaceItem: function (arr, item, newItem) {
      if (!arr) return false;
      var index = arr.indexOf(item);
      if (index == -1) index = arr.indexOf(_.find(arr, { _id: _.id(item) }));
      if (index == -1) return false;
      if (newItem) arr.splice(index, 1, newItem);
      else arr.splice(index, 1);
      return true;
    }
  });

})(_);
