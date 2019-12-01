App = {
  web3Provider: null,
  contracts: {},
  loading: false,
  account: '0x0',


  init: async () => {
    await App.initWeb3()
    await App.initAccount()
    await App.initContract()
    await App.render()
  },

  initWeb3: async () => {
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider
      web3 = new Web3(web3.currentProvider)
    } else {
      window.alert("Please connect to Metamask.")
    }
    // Modern dapp browsers...
    if (window.ethereum) {
      window.web3 = new Web3(ethereum)
      try {
        // Request account access if needed
        await ethereum.enable()
        // Acccounts now exposed
        web3.eth.sendTransaction({/* ... */})
      } catch (error) {
        // User denied account access...
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      App.web3Provider = web3.currentProvider
      window.web3 = new Web3(web3.currentProvider)
      // Acccounts always exposed
      web3.eth.sendTransaction({/* ... */})
    }
    // Non-dapp browsers...
    else {
      console.log('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  },


  initAccount: async () => {
    // Set the current blockchain account
    App.account = web3.eth.accounts[0]
  },


  initContract: async () => {
    // Create a JavaScript version of the smart contract
    const booking = await $.getJSON('Booking.json')
    // Instantiate a new truffle contract from the artifact
    App.contracts.Booking = TruffleContract(booking)
    // Connect provider to interact with contract
    App.contracts.Booking.setProvider(App.web3Provider)

    // Hydrate the smart contract with values from the blockchain
    App.boookingList = await App.contracts.Booking.deployed()

    // Listening the events
    App.listenForEvents();
  },

  render: async () => {
    // Prevent double render
    if (App.loading) {
      return
    }

    // Update app loading state
    App.setLoading(true)

    // Render Account
    $("#accountAddress").html("Your Account: " + App.account);

    // Render Bookings
    await App.renderBookings()

    // Update loading state
    App.setLoading(false)
  },

  renderBookings: async function() {
    var bookingInstance;
    var loader = $("#loader");
    var content = $("#content");

    loader.show();
    content.hide();

    // Load contract data
    App.contracts.Booking.deployed().then(function(instance) {
      bookingInstance = instance;
      return bookingInstance.periodsCount();
    }).then(function(periodsCount) {
      var periodsResults = $("#periodsResults");
      periodsResults.empty();

      var periodsSelect = $('#periodsSelect');
      periodsSelect.empty();

      for (var i = 1; i <= periodsCount; i++) {
        bookingInstance.periods(i).then(function(period) {
          var id = period[0];
          var name = period[1];
          var isPeriodAvailable = period[2];
          var availabilityStatus = "";

          // Boolean availabilty is changed to character form
          if(isPeriodAvailable) {
            availabilityStatus = "Available";
          }
          else {
            availabilityStatus = "Booked";
          }

          // Render period Result
          var periodTemplate = "<tr><th>" + id + "</th><td>" + name + "</td><td>" + availabilityStatus + "</td></tr>"
          // var periodTemplate = "<tr><th>" + id + "</th><td>" + name + "</td><td>" + isPeriodAvailable + "</td></tr>"
          periodsResults.append(periodTemplate);
          
          // Render period select option
          var periodOption = "<option value='" + id + "' >" + name + "</ option>"
          periodsSelect.append(periodOption);

        });
      }
      return bookingInstance.personsBooked(App.account);
    })
  },

  makeBooking: function() {
    var periodId = $('#periodsSelect').val();
    
    App.contracts.Booking.deployed().then(function(instance) {
      return instance.book(periodId, { from: App.account });
    }).then(function(result) {
      // Wait for bookings to update
      $("#content").hide();
      $("#loader").show();
    }).catch(function(err) {
      console.error(err);
    });
  },

  listenForEvents: function() {
    App.contracts.Booking.deployed().then(function(instance) {
      instance.bookedEvent({}, {
        toBlock: 'latest'
      }).watch(function(error, event) {
        console.log("event triggered", event)
        // Reload when a new booking is recorded
        App.render();
      });
    });
  },

  setLoading: (boolean) => {
    App.loading = boolean
    const loader = $('#loader')
    const content = $('#content')
    if (boolean) {
      loader.show()
      content.hide()
    } else {
      loader.hide()
      content.show()
    }
  }
};

$(() => {
  $(window).load(() => {
      App.init()
  })
})
