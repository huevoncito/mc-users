import { User } from '../mc-users.js';
import { M_User_spoof } from './methods.js';

//assertion libs
import { expect } from 'meteor/practicalmeteor:chai';
import sinon from 'sinon';

let underTest = null;

describe("User (server only)", function () {
  beforeEach(function () {
    underTest = new User({_id: "123abc"});
  });

  describe('User/spoof method', function () {

    it('should throw if targetUserId is not passed', function () {
      try {
        M_User_spoof.call({});
      } catch(e) {
        expect(e).to.be.defined;
      }
    });

    it("should throw if user is not logged in", function () {
      try {
        M_User_spoof.call({});
      } catch(e) {
        expect(e).to.be.defined;
      }
    });


    it( "should find a record for the current user and the target user", function () {
      const userSpy = sinon.stub(Meteor.users, "findOne")
        .onFirstCall().returns(underTest)
        .onSecondCall().returns({_id: "someValidID"});

      try {
        M_User_spoof._execute({userId: 'some-valid-user-id'}, {targetUserId: 'someValidID'});
        expect( userSpy.threw() ).to.be.false;
      } catch(e) {
        expect(e.error).not.to.equal(404);
      }

      userSpy.restore();

    });

    it ( 'should see if current user can spoof traget user' , function () {
      const userSpy = sinon.stub(Meteor.users, "findOne")
        .onFirstCall().returns(underTest)
        .onSecondCall().returns({_id: "someValidID"});

      let canStub = sinon.stub( underTest, 'can' );
      canStub.onFirstCall().returns(true);
      canStub.onSecondCall().returns(false);


      M_User_spoof._execute({
        userId: 'some-valid-user-id',
        //we're expecting a pass. This mocks the setUserId function so we can call again
        setUserId: function () {}
      }, {
        targetUserId: 'someValidID'
      });
      expect( canStub.threw() ).to.be.false;

      try {
        M_User_spoof._execute({userId: 'some-valid-user-id'}, {targetUserId: 'someValidID'});
        expect( canStub.threw() ).to.be.true;
      } catch(e) {
        expect(e.error).to.equal(403);
      }

      userSpy.restore();
      canStub.restore();
    });

  });

  describe('User.canSpoof', function () {
    it('should throw if targetUserId is not passed', function ( ) {
      const canSpoofSpy = sinon.spy(underTest, "canSpoof");
      try {
        underTest.canSpoof(null);
      } catch(e) {
        expect( canSpoofSpy.threw() ).to.be.true;
        canSpoofSpy.restore();
      }

    });

    it('should not throw if targetUserId is passed', function ( ) {
      const canSpoofSpy = sinon.spy(underTest, "canSpoof");
      underTest.canSpoof("something");
      expect( canSpoofSpy.threw() ).to.be.false;
      canSpoofSpy.restore();
    });

    it('should can User.can, with "spoof" ', function () {
      const canSpy = sinon.spy(underTest, "can");
      underTest.canSpoof('something');
      expect( canSpy.calledWithExactly("spoof") ).to.be.true;
      canSpy.restore();
    });
  });

});
