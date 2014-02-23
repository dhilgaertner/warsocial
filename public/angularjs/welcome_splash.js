function WelcomeSplashBootstrapCtrl($scope, $dialog) {
  var popup_el = angular.element('#register_popup')
    , popup_template = popup_el.html();

  $scope.dialog = $dialog.dialog({
    dialogClass: 'modal popupouter',
    backdrop: true,
    keyboard: true,
    backdropClick: true,
    template: popup_template,
    controller: 'WelcomeSplashDialogCtrl'
  });

  $scope.dialog.open();
}

function WelcomeSplashDialogCtrl($scope, dialog) {
  $scope.close = function(result) {
    dialog.close(result);
  };

  $scope.show_sign_in = function () {
    $('.signin_screen').css('display', '');
    $('.signup_screen').css('display', 'none');
    $('.welcome_splash_screen').css('display', 'none');
  };

  $scope.show_sign_up = function () {
    $('.signup_screen').css('display', '');
    $('.welcome_splash_screen').css('display', 'none');
    $('.signin_screen').css('display', 'none');
  };
}

function WelcomeSplashIntroCtrl($scope) {
}

function WelcomeSplashCtrl($scope) {
}