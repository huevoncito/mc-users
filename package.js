Package.describe({
  name: 'dbernhard:mc-users',
  version: '0.0.1',
  // Brief, one-line summary of the package.
  summary: 'Boilerplate extensions for Meteor.user',
  // URL to the Git repository containing the source code for this package.
  git: '',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Npm.depends({
  'simpl-schema': '0.1.1',
  'sinon': '3.3.0'
});

Package.onUse(function(api) {
  api.versionsFrom('1.5.2');
  api.use('ecmascript');
  api.use('underscore');
  api.use('check');
  api.use('accounts-base');
  api.use('mdg:validated-method@0.2.3');
  api.use('alanning:roles@1.2.16');
  api.addFiles(['server/server.js', 'server/methods.js'], 'server');
  api.mainModule('mc-users.js');
});

Package.onTest(function(api) {
  api.use('ecmascript');
  api.use('practicalmeteor:mocha');
  api.use('practicalmeteor:chai');
  api.use('dbernhard:mc-users');

  api.mainModule('mc-users-tests.js');
  api.mainModule('server/tests-server.js', 'server');
});
