(() => {

    'use strict';

    angular.module('ng-persist', []);

    const $persist = ($q, $localStorage) => {
        let isBrowser = false;
        let isIos     = false;
        let isAndroid = false;
        if (!window.cordova && !window.device && !window.Keychain) {
            isBrowser = true;
        } else {
            isAndroid = (window.device.platform === 'Android');
            isIos     = (window.device.platform === 'iOS');
        }

        const writeToFile = (namespace, key, val) => {
            var deferred = $q.defer();
            window.resolveLocalFileSystemURL(cordova.file.externalRootDirectory, (dir) => {
                const filename = namespace + '.' + key + '.txt';
                dir.getFile(filename, { create : true }, (file) => {
                    if(!file) {
                        deferred.reject();
                    }
                    file.createWriter((fileWriter) => {
                        fileWriter.seek(fileWriter.length);
                        var blob = new Blob([val], {type:'text/plain'});
                        fileWriter.write(blob);
                        deferred.resolve();
                    }, (err) => {
                        console.log(err);
                        deferred.reject();
                    });
                });
            });
            return deferred.promise;
        };

        const readFromFile = (namespace, key) => {
            var deferred = $q.defer();
            const filename = namespace + '.' + key + '.txt';
            window.resolveLocalFileSystemURL(cordova.file.externalRootDirectory + filename, (fileEntry) => {
                fileEntry.file((file) => {
                    var reader = new FileReader();
                    reader.onloadend = (evt) => {
                        deferred.resolve(evt.target.result);
                    };
                    reader.readAsText(file);
                });
            }, (err) => {
                console.log(err);
                deferred.reject();
            });
            return deferred.promise;
        };

        return {
            set(namespace = '', key = null, val = '') {
                const saveToLocalStorage = () => {
                    $localStorage[`${namespace}_${key}`] = val;
                };
                var deferred = $q.defer();
                if (!key) {
                    deferred.reject(new Error('must specify a key'));
                } else {
                    if (isIos) {
                        var kc = new window.Keychain();
                        kc.setForKey(() => {
                                deferred.resolve();
                            }, (err) => {
                                console.log(err);
                                deferred.reject(new Error('error saving to keychain'));
                            }, key, namespace, val);
                    } else if (isAndroid) {
                        writeToFile('activebuilding', 'sometest', 'this is my value')
                            .then(() => {
                                deferred.resolve();
                            })
                            .catch(() => {
                                saveToLocalStorage();
                                deferred.resolve();
                            });
                    } else {
                        saveToLocalStorage();
                        deferred.resolve();
                    }
                }
                return deferred.promise;
            },
            get(namespace = '', key = null, fallback = '') {
                var deferred = $q.defer();
                let val = '';
                const getFromLocalStorage = () => {
                    return $localStorage[`${namespace}_${key}`];
                };
                if (!key) {
                    deferred.reject();
                } else {
                    if (isIos) {
                        var kc = new window.Keychain();
                        kc.getForKey((val) => {
                                deferred.resolve(val);
                            }, (err) => {
                                console.log(err);
                                deferred.resolve(fallback);
                            }, key, namespace);
                    } else {
                        if (isAndroid) {
                            readFromFile('activebuilding', 'sometest')
                                .then((val) => {
                                    deferred.resolve(val);
                                    console.log('AAA :: file read : ' + val);
                                })
                                .catch(() => {
                                    val = getFromLocalStorage();
                                });
                        } else {
                            val = getFromLocalStorage();
                        }
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
                    if (isIos) {
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
