angular.module('users.manager').controller('AccountManagerController', function ($scope, locationsService, $state, accountsService, CurrentUserService, Authentication, $http, constants) {
    accountsService.init();
    $scope.accountsService = accountsService;

    $scope.determinateValue = 0;
    $scope.accountLogo = '';
    $scope.account = {
        createdBy: Authentication.user.username
    };
    console.log($scope.account);

    //changes the view, and sets current edit account
    $scope.editAccount = function (account) {

        accountsService.editAccount = account;
        $scope.accountLogo = '';
        console.log('editAccount %O', accountsService.editAccount);

        $scope.accountLogo =JSON.parse(accountsService.editAccount.preferences).logo
        console.log('logo %O',$scope.accountLogo);

        $state.go('manager.accounts.edit', {id: account.accountId})
    }


    //TODO: clean this up
    $scope.upload = function (file, accountId) {
        var mediaAssetId;
        var fileName = file[0].name;
        var obj = {
            payload: {
                fileName: file[0].name,
                userName: Authentication.user.username,
                type:'LOGO',
                accountId:accountId
            }
        };

        $http.post(constants.API_URL + '/media', obj).then(function (response, err) {
            if (err) {
                console.log(err);
            }
            if (response) {
                console.log('oncue API response %O', response)
                mediaAssetId = response.data.assetId;
                $scope.creds = {
                    bucket: 'beta.cdn.expertoncue.com',
                    access_key: 'AKIAICAP7UIWM4XZWVBA',
                    secret_key: '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'
                };
                // Configure The S3 Object
                AWS.config.update({
                    accessKeyId: $scope.creds.access_key,
                    secretAccessKey: $scope.creds.secret_key
                });
                AWS.config.region = 'us-east-1';
                var bucket = new AWS.S3({params: {Bucket: $scope.creds.bucket}});
                var params = {
                    Key: mediaAssetId + "-" + file[0].name,
                    ContentType: file[0].type,
                    Body: file[0],
                    ServerSideEncryption: 'AES256',
                    Metadata: {
                        fileKey: JSON.stringify(response.data.assetId)
                    }
                };

                bucket.putObject(params, function (err, data) {
                        $scope.loading = true;
                        if (err) {
                            // There Was An Error With Your S3 Config
                            alert(err.message);
                            return false;
                        }
                        else {
                            console.log('s3 response to upload %O', data);
                            // Success!
                            $scope.accountLogo = constants.ADS_URL + mediaAssetId + '-' + fileName;
                            console.log('logo %O', accountsService.editAccount.accountId);
                             accountsService.init();
                            $scope.$apply();
                            $scope.determinateValue = 0;

                        }
                    })
                    .on('httpUploadProgress', function (progress) {
                        // Log Progress Information
                        console.log(Math.round(progress.loaded / progress.total * 100) + '% done');
                        $scope.determinateValue = Math.round(progress.loaded / progress.total * 100);
                        $scope.$apply();
                    });
            }
            else {
                // No File Selected
                alert('No File Selected');
            }
        });
    };

});
