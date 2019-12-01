var Booking = artifacts.require("./Booking.sol");

contract("Booking", function(accounts) {
  var bookingInstance;

  it("initializes with ten periods", function() {
    return Booking.deployed().then(function(instance) {
      return instance.periodsCount();
    }).then(function(count) {
      assert.equal(count, 5);
    });
  });

  it("it initializes the periods with the correct values", function() {
    return Booking.deployed().then(function(instance) {
      bookingInstance = instance;
      return bookingInstance.periods(1);
    }).then(function(period) {
      assert.equal(period[0], 1, "contains the correct id");
      assert.equal(period[1], "Period 1", "contains the correct period");
      assert.equal(period[2], true, "contains the correct booking status");
      return bookingInstance.periods(2);
    }).then(function(period) {
      assert.equal(period[0], 2, "contains the correct id");
      assert.equal(period[1], "Period 2", "contains the correct period");
      assert.equal(period[2], true, "contains the correct booking status");
    });
  }); 

  it("allows a person to book a period", function() {
    return Booking.deployed().then(function(instance) {
      bookingInstance = instance;
      periodId = 1;
      return bookingInstance.book(periodId, { from: accounts[0] });
    }).then(function(receipt) {
      return bookingInstance.personsBooked(accounts[0]);
    }).then(function(booked) {
      assert(booked, "the person was marked as already done booking");
      return bookingInstance.periods(periodId);
    }).then(function(period) {
      var isPeriodAvailable = period[2];
      assert.equal(isPeriodAvailable, false, "Turns the switch to false (reserved)");
    })
  });

  it("throws an exception for invalid periods", function() {
    return Booking.deployed().then(function(instance) {
      bookingInstance = instance;
      return bookingInstance.book(99, { from: accounts[1] })
    }).then(assert.fail).catch(function(error) {
      assert(error.message.indexOf('revert') >= 0, "error message must contain revert");
      return bookingInstance.periods(1);
    }).then(function(period1) {
      var isPeriodAvailable = period1[2];
      assert.equal(isPeriodAvailable, false, "period 1 did not receive a booking");
      return bookingInstance.periods(2);
    }).then(function(period2) {
      var isPeriodAvailable = period2[2];
      assert.equal(isPeriodAvailable, true, "period 2 did not receive a booking");
    });
  });

  /*
  it("throws an exception for double voting", function() {
    return Election.deployed().then(function(instance) {
      electionInstance = instance;
      candidateId = 2;
      electionInstance.vote(candidateId, { from: accounts[1] });
      return electionInstance.candidates(candidateId);
    }).then(function(candidate) {
      var voteCount = candidate[2];
      assert.equal(voteCount, 1, "accepts first vote");
      // Try to vote again
      return electionInstance.vote(candidateId, { from: accounts[1] });
    }).then(assert.fail).catch(function(error) {
      assert(error.message.indexOf('revert') >= 0, "error message must contain revert");
      return electionInstance.candidates(1);
    }).then(function(candidate1) {
      var voteCount = candidate1[2];
      assert.equal(voteCount, 1, "candidate 1 did not receive any votes");
      return electionInstance.candidates(2);
    }).then(function(candidate2) {
      var voteCount = candidate2[2];
      assert.equal(voteCount, 1, "candidate 2 did not receive any votes");
    });
  });

  */

});