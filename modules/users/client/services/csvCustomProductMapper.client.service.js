/* globals angular, _ */
angular.module('users').service('csvCustomProductMapper', function (formatter, csvProductMapper) {
  var self = this

  this.EMPTY_FIELD_NAME = '-'
  this.PRODUCT_FIELDS = ['name', 'image', 'skus', 'description', 'type', 'listView', 'detailView', 'noFoundView', 'headerView']
  this.FIELD_TYPES = ['text', 'number', 'boolean', 'url', 'list', 'date', 'youtube'];

  this.PRODUCT_TYPES = {
    name: 'text',
    image: 'url',
    skus: 'list',
    description: 'text',
    type: 'text',
    listView: 'url',
    detailView: 'url',
    noFoundView: 'url',
    headerView: 'url'
  };

  this.mapProducts = function (items, columns) {
    if (_.isEmpty(columns)) return []
    var result = _.compact(_.map(items, function (obj) {
      return mapProductDto(obj, columns);
    }))

    return result
  }

  this.mapList = function (str) {
    return parseList(str);
  };

  //
  // PRIVATE FUNCTIONS
  //

  function mapProductDto (obj, columns) {
    var result = { }
    _.each(columns, function (col) {
      if (!col.mapping) return;
      var type = col.fieldType || self.PRODUCT_TYPES[col.mapping] || 'text';
      var value = mapValue(obj[col.name], type);

      if (col.new) {
        var code = formatter.codeOf(col.mapping);
        result.properties = result.properties || {};
        result.properties[code] = { label: col.mapping, value: value, type: type };
      }
      else if (col.mapping) {
        result[col.mapping] = value;

        if (col.mapping == 'type') {
          result[col.mapping] = csvProductMapper.mapProductTypeId(result[col.mapping]);
        }
      }

      if (col.enableFilter && typeof value != 'undefined' && typeof value != 'null') {
        var items = value instanceof Array ? value : [value];
        var tags = _.compact(items.map(function (item) {
          if (!item) return;
          return { filter: formatter.humanReadable(col.mapping), choice: item, active: true, selected: false };
        }));
        if (tags.length > 0) {
          result.tags = (result.tags || []).concat(tags);
        }
      }
    })
    if (_.isEmpty(result)) return null;
    return result
  }

  function mapValue(value, type) {
    if (!value) return undefined;
    value = value.toString().trim();
    if (type == 'text') return value.toString();
    if (type == 'number') return Number(value) || 0;
    if (type == 'boolean') return parseBoolean(value);
    if (type == 'url') return value.toString();
    if (type == 'list') return parseList(value);
    if (type == 'date' && moment.utc(value).isValid()) return moment.utc(value).toDate();
    if (type == 'youtube') return value.match(/youtube.com/i) ? value : 'https://www.youtube.com/embed/' + value.replace(/^\/+/, '');
    return undefined;
  }

  function parseBoolean(value) {
    if (!value) return;
    value = value.trim().toLowerCase();
    if (value === 'true' || value === '1' || value === true || value === 'yes' || value === 'on' || value == '+') return true;
    if (value === 'false' || value === '0' || value === false || value === 'no' || value === 'off') return false;
    return undefined;
  }

  function parseList(str) {
    if (!str) return [];
    if (str[0] == '"' && _.last(str) == '"') str = str.substr(1, str.length - 2); // unwrap double quotes
    if (str[0] == "'" && _.last(str) == "'") str = str.substr(1, str.length - 2); // unwrap single quotes

    var result = str.split(';');
    if (result.length > 1) return result.map(function(s) { return s.trim(); });
    return str.split(',').map(function(s) { return s.trim(); });
  }
})
