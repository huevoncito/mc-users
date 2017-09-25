//Package files for testing
import { User } from './mc-users.js';
import { M_User_setStatus } from './methods.js';

//packages to stub
import { Roles } from 'meteor/alanning:roles';

//assertion libs
import { expect } from 'meteor/practicalmeteor:chai';
import sinon from 'sinon';


//before each test, we'll reset this variable to a clean instance of the class under test
let underTest = null;

describe('User', function () {

  beforeEach( function () {
    underTest = new User({
      _id: "someId",
      name: {
        first: "Elmer",
        last: "Fudd"
      }
    });
  });

  describe('User.can', function () {

    let canSpy = null;

    beforeEach(function () {
      canSpy = sinon.spy(underTest, 'can');
    });

    afterEach(function () {
      canSpy.restore();
    });

    it('throws when no action specified', function () {
      try {
        underTest.can(null);
      } catch(e) {
        expect(canSpy.threw()).to.be.true;
        expect(e).to.be.defined;
      }
    });

    it('does not throw when action is passed', function () {
      try {
        underTest.can('action');
        expect(canSpy.threw()).to.be.false;
      } catch(e) {
        expect(e).not.to.be.defined;
      }
    });

    it('allows allowed actions', function () {
      sinon.stub( Roles, "userIsInRole").returns(true);
      expect( underTest.can('action') ).to.be.true;
      Roles.userIsInRole.restore();
    });

    it('denies actions not specifically named', function () {
      sinon.stub( Roles, "userIsInRole").returns(false);
      expect( underTest.can('action') ).to.be.false;
      Roles.userIsInRole.restore();
    });
  });

  describe('User.isAdmin', function () {
    let rollSpy = null;

    beforeEach(function () {
      rollSpy = sinon.stub(Roles, 'userIsInRole');
    });
    afterEach(function () {
      rollSpy.restore();
    });
    it('checks for admin role', function () {
      underTest.isAdmin();
      expect( rollSpy.calledWithExactly(underTest._id, 'admin') );
    });
    it('returns true if user is admin', function () {
      rollSpy.returns(true);
      expect( underTest.isAdmin() ).to.be.true;
    });

    it('returns false if user is not admin', function () {
      rollSpy.returns(false);
      expect( underTest.isAdmin() ).to.be.false;
    });

  });

  describe('User.getFullName', function () {
    it("should return an empty string if name is undefined or empty", function () {
      delete underTest.name;
      expect( underTest.getFullName() ).to.equal("");
      underTest.name = {};
      expect( underTest.getFullName() ).to.equal("");
    });
    it( "should return first and last name separated by a space", function () {
      expect( underTest.getFullName() ).to.equal("Elmer Fudd");
    });
  });

  describe('User/setStatus method', function () {
    let userStub, methodStub = null;
    let adminUser = new User({_id: "someOtherId"});


    beforeEach(function () {
      userStub = sinon.stub(Meteor.users, "findOne");
      isAdminStub = sinon.stub(adminUser, "isAdmin");
    });
    afterEach(function () {
      userStub.restore();
      isAdminStub.restore();
    });

    it('throws if no currentUser', function () {
      userStub.returns(null);
      try {
        M_User_setStatus._execute({userId: null}, {targetUserId: underTest._id, status: 'suspended'});
      } catch(e) {
        expect(e).to.be.defined;
        expect(e.error).to.equal(403);
      }
    });

    it('throws if no targetUser', function () {
      userStub.onFirstCall().returns(adminUser);
      userStub.onSecondCall().returns(underTest);
      try {
        M_User_setStatus._execute({userId: adminUser._id}, {targetUserId: underTest._id, status: 'suspended'});
      } catch(e) {
        expect(e).to.be.defined;
        expect(e.error).to.equal(403);
      }
    });

    it('throws if currentUser is not admin', function () {
      isAdminStub.returns(false);
      userStub.onFirstCall().returns(adminUser);
      userStub.onSecondCall().returns(underTest);
      try {
        M_User_setStatus._execute({userId: adminUser._id}, {targetUserId: underTest._id, status: 'suspended'});
      } catch(e) {
        expect(e.error).to.equal(403);
      }
    });

    it('prevents users from suspending themselves', function () {
      isAdminStub.returns(true);
      userStub.onFirstCall().returns(underTest);
      userStub.onSecondCall().returns(underTest);
      try {
        M_User_setStatus._execute({userId: adminUser._id}, {targetUserId: underTest._id, status: 'suspended'});
      } catch(e) {
        expect(e.error).to.equal(403);
      }
    });
    it('sets status correctly ', function () {
      isAdminStub.returns(true);
      userStub.onFirstCall().returns(adminUser);
      userStub.onSecondCall().returns(underTest);
      userStub.onThirdCall().returns(adminUser);
      userStub.onCall(3).returns(underTest);

      let updateSpy = sinon.spy(Meteor.users, "update");

      M_User_setStatus._execute({userId: adminUser._id}, {targetUserId: underTest._id, status: 'suspended'});
      expect( updateSpy.calledWithExactly( {_id: underTest._id}, {$set: {status: "suspended"}} )  ).to.be.true;

      M_User_setStatus._execute({userId: adminUser._id}, {targetUserId: underTest._id, status: 'active'});
      expect( updateSpy.calledWithExactly( {_id: underTest._id}, {$set: {status: "active"}} )  ).to.be.true;

      updateSpy.restore();
    });
  })

});
