'use strict'

// Users service used for communicating with the users REST endpoint
angular.module('core').factory('devicesService', ['$http', 'constants', '$q',
  function ($http, constants, $q) {
    var me = this

    // todo: implement global error logging for $http requests

    me.getDevices = function (accountId) {
      return $http.get(constants.API_URL + '/devices?acc=' + accountId).then(function (response) {
        var devices = response.data || []
        _.forEach(devices, initDevice)
        return devices
      }, function (err) {
        console.error(err)
        throw err
      })
    }

    me.updateDeviceConfig = function (device, config) {
      var udid = config.udid
      delete config.udid

      var payload = {
        payload: {
          deviceId: device.deviceId,
          udid: udid,
          deviceCfg: config
        }
      }

      device.udid = udid
      device.config = config

      return $http.put(constants.API_URL + '/devices/' + device.deviceId, payload).catch(function (err) {
        console.error(err)
        throw err
      })
    }

    me.deleteDevice = function (device) {
      return $http.delete(constants.API_URL + '/devices/' + device.deviceId).catch(function (err) {
        console.error(err)
        throw err
      })
    }

    me.defaultConfig = function () {
      return {
        defaultAudioVolume: 1,
        mediaInterval: 85000,
        betweenMediaInterval: 8000,
        showLogo: true,
        playAds: true,
        playProductsAds: true,
        customStyles: false,
        refreshDeviceDaily: true,
        showHMC: true,
        showBrowse: true,
        showCocktails: true,
        showPrices: true,
        showSlots: true,
        showCustomApp: false,
        enforceAgeVerification: false,
        emailTextButton: true,
        onlyMyProducts: false
      }
    }

    function initDevice (device) {
      if (!device) return device
      if (device.lastCheck) {
        device.lastCheck = moment.utc(device.lastCheck).toDate()

        var checkMinsAgo = moment.utc().diff(device.lastCheck, 'minutes')
        device.lastCheckClass = checkMinsAgo >= 60 ? 'old' : null
      }
      return device
    }

    return me
  }
])
