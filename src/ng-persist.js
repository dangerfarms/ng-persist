(() => {

    'use strict';

    angular.module('ng-persist', []);

    const $persist = ($q, $localStorage) => {
        return {
            set(namespace = '', key = null, val = '') {
                var deferred = $q.defer();
                if (!key) {
                    deferred.reject(new Error('must specify a key'));
                } else {
                    if (window.cordova && window.Keychain) {
                        var kc = new window.Keychain();
                        kc.setForKey(() => {
                                deferred.resolve();
                            }, (err) => {
                                deferred.reject(new Error('error saving to keychain'));
                            }, key, namespace, val);
                    } else {
                        $localStorage[`${namespace}_${key}`] = val;
                        deferred.resolve();
                    }
                }
                return deferred.promise;
            },
            get(namespace = '', key = null, fallback = '') {
                var deferred = $q.defer();
                let val = '';
                if (!key) {
                    deferred.reject();
                } else {
                    if (window.cordova && window.Keychain) {
                        var kc = new window.Keychain();
                        kc.getForKey((val) => {
                                deferred.resolve(val);
                            }, (err) => {
                                deferred.resolve(fallback);
                            }, key, namespace);
                    } else {
                        val = $localStorage[`${namespace}_${key}`];
                        if (val) {
                            deferred.resolve(val);
                        } else {
                            deferred.resolve(fallback);
                        }
                    }
                }
                return deferred.promise;
            },
            remove(namespace, key) {
                var deferred = $q.defer();
                if (!key || !namespace) {
                    deferred.reject();
                } else {
                    if (window.cordova && window.Keychain) {
                        var kc = new window.Keychain();
                        kc.removeForKey(() => {
                                deferred.reject();
                            }, () => {
                                deferred.reject();
                            }, key, namespace);
                    } else {
                        delete $localStorage[`${namespace}_${key}`];
                        deferred.resolve();
                    }
                }
                return deferred.promise;
            },
        };
    };

    angular.module('ng-persist').factory('$persist', $persist);

}());
