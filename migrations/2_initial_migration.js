var Booking = artifacts.require("./Booking.sol");

module.exports = function(deployer) {
  deployer.deploy(Booking);
};