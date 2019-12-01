pragma solidity ^0.5.0;

contract Booking {

    // Model a Period struct for a booking period
    struct Period {
        uint id;
        string period;
        bool isPeriodAvailable;
    }

    // List of periods under booking and the status of the booking per period
    mapping(uint => Period) public periods;

    // Store accounts that have already booked a period to check double-booking
    mapping(address => bool) public personsBooked;

    // Store count of the periods under booking
    uint public periodsCount;

    // Event that triggers the disable of the submit button
    event bookedEvent (
        uint indexed _periodId
    );

    constructor () public {
        addPeriod("Period 1");
        addPeriod("Period 2");
        addPeriod("Period 3");
        addPeriod("Period 4");
        addPeriod("Period 5");
    }

    // Function to add a period available for booking to the mapping structure
    function addPeriod(string memory _period) private {
        periodsCount ++;
        periods[periodsCount].id = periodsCount;
        periods[periodsCount].period = _period;
        periods[periodsCount].isPeriodAvailable = true;
    }

    // Function for booking
    function book (uint _periodId) public {
        // Check that the booking person has not booked a period yet
        require(!personsBooked[msg.sender]);

        // Check that the period to be booked is valid
        require(_periodId > 0 && _periodId <= periodsCount);

        // Record that booking person has booked a period
        personsBooked[msg.sender] = true;

        // Update the status of the booking to false  (i.e booked)
        periods[_periodId].isPeriodAvailable = false;


        // Trigger booked event
        emit bookedEvent(_periodId);

    }

}