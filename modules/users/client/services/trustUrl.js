angular.module("users.supplier").filter("trustUrl", [ '$sce', function ($sce) {
    return function (recordingUrl) {
        return $sce.trustAsResourceUrl(recordingUrl);
    };
} ]);
