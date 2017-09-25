import { User } from '../mc-users.js';

import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { _ } from 'meteor/underscore';

_.extend(User.prototype, {
  /**
  * Verify that user is authorized to spoof another user
  *
  * @method canSpoof
  * @param {String|String[]} - targetUserId - _id of user to be spoofed
  * @return  {Boolean}
  */
    canSpoof(targetUserId) {
      //verify prop
      check(targetUserId, String);
      //Default implementation defers to generic can method.
      //We keep this separate though, in case we want to overwrite this method
      //with client-specific requirements in mind.
      return this.can('spoof');
    }
});
