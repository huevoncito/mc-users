import { ValidatedMethod } from 'meteor/mdg:validated-method';
import SimpleSchema from 'simpl-schema';


import './server.js';

//METEOR METHODS
export const M_User_spoof = new ValidatedMethod({
  name: 'User.spoof',
  validate: new SimpleSchema({
    targetUserId: { type: String, required: true }
  }).validator(),
  run({ targetUserId }) {


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
    if ( !currentUser.canSpoof( targetUserId ) ) {
      throw new Meteor.Error(403, "Access denied", "You are not authorized to do this (3)");
    }

    //setup the spoof
    this.setUserId(targetUserId);
    return targetUserId;

  }
});
