/* global angular */
angular.module('core').factory('authToken', function ($window) {
  var me = this
  var storage = $window.localStorage
  var cachedToken
  var userToken = 'token'

  // Save Token to Storage as 'token'
  function setToken (token) {
    cachedToken = token
    storage.setItem(userToken, token)
  }

  // Get token 'token' from storage
  function getToken () {
    if (!cachedToken) {
      cachedToken = storage.getItem(userToken)
    }
    return cachedToken
  }

  // Returns true or false based on whether or not token exists in storage
  function isAuthenticated () {
    return !!getToken()
  }

  // Returns true or false based on whether or not token exists in storage
  function hasTokenInStorage () {
    return storage.getItem(userToken) !== null
  }

  // Removes token
  function removeToken () {
    cachedToken = null
    storage.removeItem(userToken)
  }

  me.setToken = setToken
  me.getToken = getToken
  me.isAuthenticated = isAuthenticated
  me.removeToken = removeToken
  me.hasTokenInStorage = hasTokenInStorage

  return me
})
