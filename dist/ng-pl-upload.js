/**!
 * AngularJS file upload directive with plUpload
 * @author Javier Martínez <ecentinela@gmail.com>
 * @version 0.2.0
 */

/* global angular, plupload */

(function () {
  'use strict';

  angular.module('ngPlUpload', []).directive(
    'ngPlUpload',
    [
      function () {
        return {
          scope: {
            'ngPlUploadFilesModel': '=',
            'ngPlUploadFiltersModel': '=',
            'ngPlUploadHeadersModel': '=',
            'ngPlUploadInstance': '=',
            'ngPlUploadMultiParamsModel': '=',
            'ngPlUploadProgressModel': '='
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

            if ($attrs.ngPlUploadPreventDuplicates) {
              $attrs.$set('ngPlUploadPreventDuplicates', $attrs.ngPlUploadPreventDuplicates === 'true');
            } else {
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

            if ($attrs.ngPlUploadMultiSelection) {
              $attrs.$set('ngPlUploadMultiSelection', $attrs.ngPlUploadMultiSelection === 'true');
            } else {
              $attrs.$set('ngPlUploadMultiSelection', true);
            }

            if (!$attrs.ngPlUploadRequiredFeatures) {
              $attrs.$set('ngPlUploadRequiredFeatures', {});
            }

            if ($attrs.ngPlUploadUniqueNames) {
              $attrs.$set('ngPlUploadUniqueNames', $attrs.ngPlUploadUniqueNames === 'true');
            } else {
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

            if ($attrs.ngPlUploadAutoUpload) {
              $attrs.$set('ngPlUploadAutoUpload', $attrs.ngPlUploadAutoUpload === 'true');
            } else {
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

              if ($attrs.ngPlUploadAutoUpload) {
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

            if ($attrs.ngPlInit) {
              uploader.bind('Init',function (up) {
                $scope.$parent.$apply(function (self) {
                  self[$attrs.ngPlInit](up);
                });
              });
            }

            if ($attrs.ngPlPostInit) {
              uploader.bind('PostInit',function (up) {
                $scope.$parent.$apply(function (self) {
                  self[$attrs.ngPlPostInit](up);
                });
              });
            }

            if ($attrs.ngPlOptionChanged) {
              uploader.bind('OptionChanged',function (up, name, newValue, oldValue) {
                $scope.$parent.$apply(function (self) {
                  self[$attrs.ngPlOptionChanged](up, name, newValue, oldValue);
                });
              });
            }

            if ($attrs.ngPlRefresh) {
              uploader.bind('Refresh',function (up) {
                $scope.$parent.$apply(function (self) {
                  self[$attrs.ngPlRefresh](up);
                });
              });
            }

            if ($attrs.ngPlStateChanged) {
              uploader.bind('StateChanged',function (up) {
                $scope.$parent.$apply(function (self) {
                  self[$attrs.ngPlStateChanged](up);
                });
              });
            }

            if ($attrs.ngPlUploadFile) {
              uploader.bind('UploadFile',function (up, file) {
                $scope.$parent.$apply(function (self) {
                  self[$attrs.ngPlUploadFile](up, file);
                });
              });
            }

            if ($attrs.ngPlBeforeUpload) {
              uploader.bind('BeforeUpload',function (up, file) {
                $scope.$parent.$apply(function (self) {
                  self[$attrs.ngPlBeforeUpload](up, file);
                });
              });
            }

            if ($attrs.ngPlQueueChanged) {
              uploader.bind('QueueChanged',function (up) {
                $scope.$parent.$apply(function (self) {
                  self[$attrs.ngPlQueueChanged](up);
                });
              });
            }

            if ($attrs.ngPlUploadProgress) {
              uploader.bind('UploadProgress',function (up, file) {
                $scope.$parent.$apply(function (self) {
                  self[$attrs.ngPlUploadProgress](up, file);
                });
              });
            }

            if ($attrs.ngPlFilesRemoved) {
              uploader.bind('FilesRemoved',function (up, files) {
                $scope.$parent.$apply(function (self) {
                  self[$attrs.ngPlFilesRemoved](up, files);
                });
              });
            }

            if ($attrs.ngPlFileFiltered) {
              uploader.bind('FileFiltered',function (up, file) {
                $scope.$parent.$apply(function (self) {
                  self[$attrs.ngPlFileFiltered](up, file);
                });
              });
            }

            if ($attrs.ngPlFilesAdded) {
              uploader.bind('FilesAdded',function (up, files) {
                $scope.$parent.$apply(function (self) {
                  self[$attrs.ngPlFilesAdded](up, files);
                });
              });
            }

            if ($attrs.ngPlFileUploaded) {
              uploader.bind('FileUploaded',function (up, file, response) {
                $scope.$parent.$apply(function (self) {
                  self[$attrs.ngPlFileUploaded](up, file, response);
                });
              });
            }

            if ($attrs.ngPlChunkUploaded) {
              uploader.bind('ChunkUploaded',function (up, file, response) {
                $scope.$parent.$apply(function (self) {
                  self[$attrs.ngPlChunkUploaded](up, file, response);
                });
              });
            }

            if ($attrs.ngPlUploadComplete) {
              uploader.bind('UploadComplete',function (up, files) {
                $scope.$parent.$apply(function (self) {
                  self[$attrs.ngPlUploadComplete](up, files);
                });
              });
            }

            if ($attrs.ngPlUploadError) {
              uploader.bind('Error', function(up, error) {
                $scope.$parent.$apply(function (self) {
                  self[$attrs.ngPlUploadError](up, error);
                });
              });
            }

            if ($attrs.ngPlUploadInstance) {
              $scope.ngPlUploadInstance = uploader;
            }
          }
        };
      }
    ]
  );

})();
