/*

By @huevoncito
Boilerplate code to extend Meteor.user behaviour

*/

//meteor core
import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import { check } from 'meteor/check';

//meteor packages
import { Roles } from 'meteor/alanning:roles';

//npm modules

//includes



/*
*@class User
*
*@param {object} - doc - the user record that will inherit from the class
*
*/
export class User {
  constructor(doc) {
    _.extend(this, doc);
  }

  /**
  * Get the user's full name
  *
  * @method getFullName
  * @returns {String} - Full Name
  */
  getFullName() {
    return !!this.name &&
           !_.isEmpty(this.name) &&
           `${this.name.first} ${this.name.last}` || "";
  }


  /**
  * Determine whether a user is authorized to perform an action
  *
  * @method can
  * @param {String} - action - Action user is trying to perform
  * @param {Object} - opts - options (optional)
  * @returns {Boolean}
  */
  can(action, opts = {}) {
    check( action, String );
    return Roles.userIsInRole(this._id, action);
  }

  /**
  * Determine if user is an administrator
  *
  * @method isAdmin
  * @returns {Boolean}
  */
  isAdmin() {
    return Roles.userIsInRole(this._id, 'admin');
  }

}


//Transform the result of Meteor.users.find to return an instance of our class
//We can't technically extend the Meteor.users collection as is.
//This is a great workaround by @matb33
export function userTransform ( transformClass ) {
    const transform = function (doc) { return new transformClass(doc); };
    const find = Meteor.users.find;
    const findOne = Meteor.users.findOne;

    Meteor.users.find = function(selector, options) {
    	selector = selector || {};
    	options = options || {};
    	return find.call(this, selector, _.extend({transform: transform}, options));
    };

    Meteor.users.findOne = function (selector, options) {
    	selector = selector || {};
    	options = options || {};
    	return findOne.call(this, selector, _.extend({transform: transform}, options));
    };
}






//Common Meteor Methods
