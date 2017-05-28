(function(_) {
    'use strict';

    _.mixin({
        buildUrl: function(str) {
            return _.safeUrl((str || '').replace(/\/+/g, '-')).toLowerCase();
        },
        safeUrl: function(str) {
            if (typeof str != 'string') return str;
            return str.replace(/'"/g, '').replace(/[^a-z0-9\-/%._&+]+/gi, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
        },
        absPageUrl: function(page, client) {
            client = client || page.client;
            var result = page.path || page.url || _.buildUrl(page.name) || '';
            var siteUrl = page.status == 'Live' ? client.production_url : client.beta_url;
            result = _.combinePath(siteUrl, result);
            return result;
        },
        unionItems: function(arr1, arr2) {
            var arrs = _.toArray(arguments).map(function(arr) {
                return arr instanceof Array ? arr : [arr];
            });
            var result = _.compact(_.union.apply(_, arrs));
            return result;
        },
        findItemByKey: function(arr, key) {
            var item = _.find(arr, function(item) {
                    return key in (item || {});
                }) || null;
            return item;
        },
        replicate: function(count, item) {
            if (typeof item == 'string') {
                return new Array(Math.max(0, count + 1)).join(item) || '';
            }
            else if (item instanceof Array) {
                return _.flatten(_.range(count).map(function() {
                    return item;
                }));
            }
            else {
                throw Error('unsupported type', item);
            }
        },
        isEmbedMode: function() {
            return window.location.pathname == '/embed';
        },
        removeItem: function(arr, item) {
            return _.replaceItem(arr, item, undefined);
        },
        replaceItem: function(arr, item, newItem) {
            if (!arr) return false;
            var index = arr.indexOf(item);
            if (index == -1) return false;
            if (newItem) arr.splice(index, 1, newItem);
            else arr.splice(index, 1);
            return true;
        },
        combinePath: function(path1, path2, pathN) {
            var paths = _.compact(_.toArray(arguments));
            var result = _.compact(paths.map(function(p) {
                return p.replace(/^\/+|\/+$/g, '');
            })).join('/');

            if (paths[0].substr(0, 2) == '//') result = '//' + result;
            else if (paths[0][0] == '/') result = '/' + result;

            if (_.last(_.last(paths)) == '/') result += '/';
            return result;
        },
        id: function(entityOrId) {
            return entityOrId && entityOrId._id || entityOrId;
        },
        findById: function(arr, entityOrId) {
            entityOrId = _.id(entityOrId);
            return _.find(arr, function(item) {
                return _.id(item) == entityOrId;
            });
        },

        /**
         * Merges card actions (an array of key-value objects) to the only object
         * Example:
         * Input: [{variable:'value'}, {bgcolor:'white'}]
         * Output: {variable:'value', bgcolor:'white'}
         */
        mergeActions: function(actions) {
            var obj = _.object(_.map(actions, function(v) {
                if (!v) return;
                var key = _.keys(v)[0];
                return [key, v[key]];
            }));
            return obj;
        },
        deepClone: function(obj) {
            if (!obj) return obj;
            if (obj instanceof Array) return _.map(obj, _.deepClone);
            if (obj.constructor) return new obj.constructor(angular.copy(obj));
            return angular.copy(obj);
        },
        addAfter: function(arr, item, newItem) {
            var idx = _.indexOf(arr, item);
            if (idx === -1) arr.push(newItem);
            else arr.splice(idx + 1, 0, newItem);
        },
        codeOf: function(name) {
            return (name || '').toString().replace(/[^a-z0-9_]+/gi, '_').trim().replace(/^_+|_+$/g, '').toLowerCase()
        },
        escapeRegex: function(text) {
            return text.replace(/[-\/\\^$*+?.()|[\]{}:]/g, '\\$&')
        }
    });

})(_);
