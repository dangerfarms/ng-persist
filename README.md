# ng-persist

- returns $q promises
- works in the browser with [local storage](https://github.com/gsklee/ngStorage)

## Install

```
$ bower install ng-persist ngstorage --save
```

For ios, [KeychainPlugin](https://github.com/shazron/KeychainPlugin) is required:

```
$ cordova plugin add https://github.com/shazron/KeychainPlugin.git
```

Android support is coming soon.

## Usage

Require ng-cordova and ngstorage

```js
angular.module('myApp', [
    'ngStorage',
    'ng-cordova'
]);
```

Inject ```$persist``` into your controller

```js
.controller('MyCtrl', function($persist) {

    // write
    $persist
        .set(namespace, key, val)
        .then(function () {
            // saved
        });

    // read
    $persist
        .get(namespace, key, fallback)
        .then(function (val) {
            // val is either the value, if exists, or the fallback
        });

    // delete
    $persist
        .remove(namespace, key)
        .then(function () {
            // removed
        });

});
```

## License

MIT
