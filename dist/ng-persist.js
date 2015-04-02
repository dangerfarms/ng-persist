"use strict";

(function () {

    "use strict";

    angular.module("ng-persist", []);

    var $persist = function ($q, $localStorage) {
        return {
            set: function set() {
                var namespace = arguments[0] === undefined ? "" : arguments[0];
                var key = arguments[1] === undefined ? null : arguments[1];
                var val = arguments[2] === undefined ? "" : arguments[2];

                var deferred = $q.defer();
                if (!key) {
                    deferred.reject(new Error("must specify a key"));
                } else {
                    if (window.cordova && window.Keychain) {
                        var kc = new window.Keychain();
                        kc.setForKey(function () {
                            deferred.resolve();
                        }, function (err) {
                            deferred.reject(new Error("error saving to keychain"));
                        }, key, namespace, val);
                    } else {
                        $localStorage["" + namespace + "_" + key] = val;
                        deferred.resolve();
                    }
                }
                return deferred.promise;
            },
            get: function get() {
                var namespace = arguments[0] === undefined ? "" : arguments[0];
                var key = arguments[1] === undefined ? null : arguments[1];
                var fallback = arguments[2] === undefined ? "" : arguments[2];

                var deferred = $q.defer();
                var val = "";
                if (!key) {
                    deferred.reject();
                } else {
                    if (window.cordova && window.Keychain) {
                        var kc = new window.Keychain();
                        kc.getForKey(function (val) {
                            deferred.resolve(val);
                        }, function (err) {
                            deferred.resolve(fallback);
                        }, key, namespace);
                    } else {
                        val = $localStorage["" + namespace + "_" + key];
                        if (val) {
                            deferred.resolve(val);
                        } else {
                            deferred.resolve(fallback);
                        }
                    }
                }
                return deferred.promise;
            },
            remove: function remove(namespace, key) {
                var deferred = $q.defer();
                if (!key || !namespace) {
                    deferred.reject();
                } else {
                    if (window.cordova && window.Keychain) {
                        var kc = new window.Keychain();
                        kc.removeForKey(function () {
                            deferred.reject();
                        }, function () {
                            deferred.reject();
                        }, key, namespace);
                    } else {
                        delete $localStorage["" + namespace + "_" + key];
                        deferred.resolve();
                    }
                }
                return deferred.promise;
            } };
    };

    angular.module("ng-cordova-persist").factory("$persist", $persist);
})();