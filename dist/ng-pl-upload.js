/**!
 * AngularJS file upload directive with plUpload
 * @author Javier Martínez <ecentinela@gmail.com>
 * @version 0.1.0
 */

(function () {

  angular.module('ngPlUpload', []).directive(
    'ngPlUpload',
    [
      function () {
        return {
          scope: {
            'ngPlUploadHeadersModel': '=',
            'ngPlUploadMultiParamsModel': '=',
            'ngPlUploadFiltersModel': '=',
            'ngPlUploadFilesModel': '=',
            'ngPlUploadProgressModel': '=',
            'ngPlUploadInstance': '='
          },
          link: function ($scope, $element, $attrs) {
            var
              uploader,
              options,
              randomString = function() {
                var
                  i,
                  randomPoz,
                  randomString = '',
                  len = 5,
                  charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

                for (i = 0; i < len; i = i + 1) {
                  randomPoz = Math.floor(Math.random() * charSet.length);
                  randomString += charSet.substring(randomPoz, randomPoz + 1);
                }

                return randomString;
              };

            if (!$attrs.id) {
              $attrs.$set(
                'id', 'ng-pl-upload-' + randomString()
              );
            }

            if (!$attrs.ngPlUploadUrl) {
              $attrs.$set('ngPlUploadUrl', 'upload.php');
            }

            if (typeof $scope.ngPlUploadFiltersModel === 'undefined') {
              $scope.filters = [{
                title: 'Image files',
                extensions: 'jpg,jpeg,gif,png'
              }];
            }
            else {
              $scope.filters = $scope.ngPlUploadFiltersModel;
            }

            if (!$attrs.ngPlUploadMaxFileSize) {
              $attrs.$set('ngPlUploadMaxFileSize', '10mb');
            }

            if (!$attrs.ngPlUploadPreventDuplicates) {
              $attrs.$set('ngPlUploadPreventDuplicates', false);
            }

            if (!$attrs.ngPlUploadMaxRetries) {
              $attrs.$set('ngPlUploadMaxRetries', 0);
            }

            if (!$attrs.ngPlUploadChunkSize) {
              $attrs.$set('ngPlUploadChunkSize', 0);
            }

            if (!$attrs.ngPlUploadDropElement) {
              $attrs.$set('ngPlUploadDropElement', false);
            }

            if (!$attrs.ngPlUploadMultiSelection) {
              $attrs.$set('ngPlUploadMultiSelection', true);
            }

            if (!$attrs.ngPlUploadRequiredFeatures) {
              $attrs.$set('ngPlUploadRequiredFeatures', {});
            }

            if (!$attrs.ngPlUploadUniqueNames) {
              $attrs.$set('ngPlUploadUniqueNames', false);
            }

            if (!$attrs.ngPlUploadRuntimes) {
              $attrs.$set('ngPlUploadRuntimes', 'html5,flash,silverlight,html4');
            }

            if (!$attrs.ngPlUploadFileDataName) {
              $attrs.$set('ngPlUploadFileDataName', 'file');
            }

            if (!$attrs.ngPlUploadFlashSwfUrl) {
              $attrs.$set('ngPlUploadFlashSwfUrl', 'lib/plupload/plupload.flash.swf');
            }

            if (!$attrs.ngPlUploadSilverlightXapUrl) {
              $attrs.$set('ngPlUploadSilverlightXapUrl', 'lib/plupload/plupload.flash.silverlight.xap');
            }

            if (!$attrs.ngPlUploadAutoUpload) {
              $attrs.$set('ngPlUploadAutoUpload', true);
            }

            options = {
              browse_button: $attrs.id,
              url: $attrs.ngPlUploadUrl,

              filters: {
                mime_types: $scope.filters,
                max_file_size: $attrs.ngPlUploadMaxFileSize,
                prevent_duplicates: $attrs.ngPlUploadPreventDuplicates,
              },

              headers: $scope.ngPlUploadHeadersModel || null,
              multipart: $scope.ngPlUploadMultiParamsModel !== null,
              multipart_params: $scope.ngPlUploadMultiParamsModel || null,
              max_retries: $attrs.ngPlUploadMaxRetries,

              chunk_size: $attrs.ngPlUploadChunkSize,

              drop_element: $attrs.ngPlUploadDropElement,

              multi_selection: $attrs.ngPlUploadMultiSelection,
              required_features: $attrs.ngPlUploadRequiredFeatures,
              unique_names: $attrs.ngPlUploadUniqueNames,

              runtimes: $attrs.ngPlUploadRuntimes,
              file_data_name: $attrs.ngPlUploadFileDataName,
              flash_swf_url: $attrs.ngPlUploadFlashSwfUrl,
              silverlight_xap_url: $attrs.ngPlUploadSilverlightXapUrl
            };

            uploader = new plupload.Uploader(options);

            uploader.init();

            uploader.bind('FilesAdded',function (up, files) {
              if ($attrs.ngPlUploadFilesModel) {
                $scope.$apply(function () {
                  angular.forEach(files, function (file) {
                    $scope.ngPlUploadFilesModel.push(file);
                  });
                });
              }

              if ($attrs.ngPlUploadAutoUpload === 'true') {
                uploader.start();
              }
            });

            uploader.bind('UploadProgress',function (up, file) {
              if (!$attrs.ngPlUploadProgressModel) {
                return;
              }

              if ($attrs.ngPlUploadFilesModel) {
                $scope.$apply(function () {
                  var sum = 0;

                  angular.forEach($scope.ngPlUploadFilesModel, function (file) {
                    sum += file.percent;
                  });

                  $scope.ngPlUploadProgressModel = sum / $scope.ngPlUploadFilesModel.length;
                });
              }
              else {
                $scope.$apply(function () {
                  $scope.ngPlUploadProgressModel = file.percent;
                });
              }
            });

            if ($attrs.ngPlUploadComplete) {
              uploader.bind('UploadComplete',function () {
                $scope.$parent.$apply($attrs.ngPlUploadComplete);
              });
            }

            if ($attrs.ngPlUploadInstance) {
              $scope.ngPlUploadInstance = uploader;
            }

            if ($attrs.ngPlUploadError) {
              uploader.bind('Error', function() {
                $scope.$parent.$apply($attrs.ngPlUploadError);
              });
            }
          }
        };
      }
    ]
  );

})();
