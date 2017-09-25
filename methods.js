import { ValidatedMethod } from 'meteor/mdg:validated-method';
import SimpleSchema from 'simpl-schema';


//METEOR METHODS
export const M_User_setStatus = new ValidatedMethod({
  name: 'User.setStatus',
  validate: new SimpleSchema({
    targetUserId: { type: String, required: true },
    status: { type: String, required: true, allowedValues: ['suspended', 'active'] }
  }).validator(),
  run({ targetUserId, status }) {

    if ( !this.userId ) {
      throw new Meteor.Error(403, "Access denied", "You are not authorized to do this (1)");
    }

    //ensure we have a valid record for this user
    const currentUser = Meteor.users.findOne({_id: this.userId}, {fields: { roles: 1 }});
    if ( !currentUser ) {
      throw new Meteor.Error(403, "Access denied", "You are not authorized to do this (2)");
    }

    //make sure the target user acually exists
    const targetUser = Meteor.users.findOne({_id: targetUserId}, {fields: {_id: 1}});
    if ( !targetUser ) {
      throw new Meteor.Error(404, "Not found", "This user doesn't exist");
    }

    //make sure our user is authorized to spoof this user
    if ( !currentUser.isAdmin( ) ) {
      throw new Meteor.Error(403, "Access denied", "You are not authorized to do this (3)");
    }

    //you can't change your own status
    if ( currentUser._id ===  this._id ) {
      throw new Meteor.Error(403, "Access denied", "You cannot suspend yourself");
    }

    //we've passed the checks now, so let's assume
    return Meteor.users.update({_id: targetUserId}, {$set: { status }})
  }
});
