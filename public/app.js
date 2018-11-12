/*
 * Frontend Logic for application
 *
 */

// Container for frontend application
var app = {};
// Config
app.config = {
  'sessionToken' : false
};

// AJAX Client (for RESTful API)
app.client = {};

// Interface for making API calls
app.client.request = function(headers,path,method,queryStringObject,payload,callback){

  // Set defaults
  headers = typeof(headers) == 'object' && headers !== null ? headers : {};
  path = typeof(path) == 'string' ? path : '/';
  method = typeof(method) == 'string' && ['POST','GET','PUT','DELETE'].indexOf(method.toUpperCase()) > -1 ? method.toUpperCase() : 'GET';
  queryStringObject = typeof(queryStringObject) == 'object' && queryStringObject !== null ? queryStringObject : {};
  payload = typeof(payload) == 'object' && payload !== null ? payload : {};
  callback = typeof(callback) == 'function' ? callback : false;

  // For each query string parameter sent, add it to the path
  var requestUrl = path+'?';
  var counter = 0;
  for(var queryKey in queryStringObject){
    if(queryStringObject.hasOwnProperty(queryKey)){
      counter++;
      // If at least one query string parameter has already been added, preprend new ones with an ampersand
      if(counter > 1){
        requestUrl+='&';
      }
      // Add the key and value
      requestUrl+=queryKey+'='+queryStringObject[queryKey];
    }
  }

  // Form the http request as a JSON type
  var xhr = new XMLHttpRequest();
  xhr.open(method, requestUrl, true);
  xhr.setRequestHeader("Content-type", "application/json");

  // For each header sent, add it to the request
  for(var headerKey in headers){
    if(headers.hasOwnProperty(headerKey)){
      xhr.setRequestHeader(headerKey, headers[headerKey]);
    }
  }

  // If there is a current session appToken set, add that as a header
  if(app.config.sessionToken){
    xhr.setRequestHeader("tokenid", app.config.sessionToken.id);
  }

  // When the request comes back, handle the response
  xhr.onreadystatechange = function() {
    if(xhr.readyState == XMLHttpRequest.DONE) {
      var statusCode = xhr.status;
      var responseReturned = xhr.responseText;

      // Callback if requested
      if(callback){
        try{
          var parsedResponse = JSON.parse(responseReturned);
          callback(statusCode,parsedResponse);
        } catch(e){
          callback(statusCode,false);
        }

      }
    }
  };

  // Send the payload as JSON
  var payloadString = JSON.stringify(payload);
  console.log(payloadString);
  xhr.send(payloadString);

};

// Bind the logout button
app.bindLogoutButton = function(){
  document.getElementById("logoutButton").addEventListener("click", function(e){

    // Stop it from redirecting anywhere
    e.preventDefault();

    // Log the user out
    app.logUserOut();

  });
};

// Log the user out then redirect them
app.logUserOut = function(redirectUser){
  // Set redirectUser to default to true
  redirectUser = typeof(redirectUser) == 'boolean' ? redirectUser : true;

  // Get the current appToken id
  var appTokenId = typeof(app.config.sessionToken.id) == 'string' ? app.config.sessionToken.id : false;

  // Send the current appToken to the appTokens endpoint to delete it
  var queryStringObject = {
    'id' : appTokenId
  };
  app.client.request(undefined,'api/tokens','DELETE',queryStringObject,undefined,function(statusCode,responsePayload){
    // Set the app.config appToken as false
    app.setSessionToken(false);

    // Send the user to the logged out page
    if(redirectUser){
      window.location = '/loggedout';
    }

  });
};

// Bind the forms
app.bindForms = function(){
  if(document.querySelector("form")){

    var allForms = document.querySelectorAll("form");
    for(var i = 0; i < allForms.length; i++){
      allForms[i].addEventListener("submit", function(e){

        // Stop it from submitting
        e.preventDefault();
        var formId = this.id;
        var path = this.action;
        var method = this.method.toUpperCase();

        // Hide the error message (if it's currently shown due to a previous error)
        document.querySelector("#"+formId+" .formError").style.display = 'none';

        // Hide the success message (if it's currently shown due to a previous error)
        if(document.querySelector("#"+formId+" .formSuccess")){
          document.querySelector("#"+formId+" .formSuccess").style.display = 'none';
        }


        // Turn the inputs into a payload
        var payload = {};
        var elements = this.elements;
        for(var i = 0; i < elements.length; i++){
          if(elements[i].type !== 'submit'){
            // Determine class of element and set value accordingly
            var classOfElement = typeof(elements[i].classList.value) == 'string' && elements[i].classList.value.length > 0 ? elements[i].classList.value : '';
            var valueOfElement = elements[i].type == 'checkbox' && classOfElement.indexOf('multiselect') == -1 ? elements[i].checked : classOfElement.indexOf('intval') == -1 ? elements[i].value : parseInt(elements[i].value);
            var elementIsChecked = elements[i].checked;
            // Override the method of the form if the input's name is _method
            var nameOfElement = elements[i].name;
            if(nameOfElement == '_method'){
              method = valueOfElement;
            } else {
              // Create an payload field named "method" if the elements name is actually httpmethod
              if(nameOfElement == 'httpmethod'){
                nameOfElement = 'method';
              }
              // Create an payload field named "id" if the elements name is actually uid
              if(nameOfElement == 'uid'){
                nameOfElement = 'id';
              }
              // If the element has the class "multiselect" add its value(s) as array elements
              if(classOfElement.indexOf('multiselect') > -1){
                if(elementIsChecked){
                  payload[nameOfElement] = typeof(payload[nameOfElement]) == 'object' && payload[nameOfElement] instanceof Array ? payload[nameOfElement] : [];
                  payload[nameOfElement].push(valueOfElement);
                }
              } else {
                payload[nameOfElement] = valueOfElement;
              }

            }
          }
        }

        // If the method is DELETE, the payload should be a queryStringObject instead
        var queryStringObject = method == 'DELETE' ? payload : {};
        if (['accountEdit1', 'accountEdit2', 'accountEdit3'].includes(formId)){
          queryStringObject = {email: payload.email};
          delete payload.email;
        }

        // Call the API
        app.client.request(undefined,path,method,queryStringObject,payload,function(statusCode,responsePayload){
          // Display an error on the form if needed
          if(statusCode !== 200){

            if(statusCode == 403){
              // log the user out
              app.logUserOut();

            } else {

              // Try to get the error from the api, or set a default error message
              var error = typeof(responsePayload.message) == 'string' ? responsePayload.message : 'An error has occured, please try again';

              // Set the formError field with the error text
              document.querySelector("#"+formId+" .formError").innerHTML = error;

              // Show (unhide) the form error field on the form
              document.querySelector("#"+formId+" .formError").style.display = 'block';
            }
          } else {
            // If successful, send to form response processor
            app.formResponseProcessor(formId,payload,responsePayload);
          }

        });
      });
    }
  }
};

// Form response processor
app.formResponseProcessor = function(formId,requestPayload,responsePayload){
  var functionToCall = false;
  // If account creation was successful, try to immediately log the user in
  if(formId == 'accountCreate'){
    // Take the email and password, and use it to log the user in
    var newPayload = {
      'email' : requestPayload.email,
      'password' : requestPayload.password
    };

    app.client.request(undefined,'api/tokens','POST',undefined,newPayload,function(newStatusCode,newResponsePayload){
      // Display an error on the form if needed
      if(newStatusCode !== 200){

        // Set the formError field with the error text
        document.querySelector("#"+formId+" .formError").innerHTML = 'Sorry, an error has occured. Please try again.';

        // Show (unhide) the form error field on the form
        document.querySelector("#"+formId+" .formError").style.display = 'block';

      } else {
        // If successful, set the appToken and redirect the user
        app.setSessionToken(newResponsePayload.data);
        window.location = '/items/available';
      }
    });
  }
  // If login was successful, set the appToken in localstorage and redirect the user
  if(formId == 'sessionCreate'){
    app.setSessionToken(responsePayload.data);
    window.location = '/items/available';
  }

  // If forms saved successfully and they have success messages, show them
  var formsWithSuccessMessages = ['accountEdit1', 'accountEdit2','checksEdit1'];
  if(formsWithSuccessMessages.indexOf(formId) > -1){
    document.querySelector("#"+formId+" .formSuccess").style.display = 'block';
  }

  // If the user just deleted their account, redirect them to the account-delete page
  if(formId == 'accountEdit3'){
    app.logUserOut(false);
    window.location = '/account/deleted';
  }

  // If the user just created a new check successfully, redirect back to the dashboard
  if(formId == 'checksCreate'){
    window.location = '/items/available';
  }

  // If the user just deleted a check, redirect them to the dashboard
  if(formId == 'checksEdit2'){
    window.location = '/items/available';
  }

};

// Get the session appToken from localstorage and set it in the app.config object
app.getSessionToken = function(){
  var appTokenString = localStorage.getItem('appToken');
  if(typeof(appTokenString) == 'string'){
    try{
      var token = JSON.parse(appTokenString);
      app.config.sessionToken = token;
      if(typeof(token) == 'object'){
        app.setLoggedInClass(true);
      } else {
        app.setLoggedInClass(false);
      }
    }catch(e){
      app.config.sessionToken = false;
      app.setLoggedInClass(false);
    }
  }
};

// Set (or remove) the loggedIn class from the body
app.setLoggedInClass = function(add){
  var target = document.querySelector("body");
  if(add){
    target.classList.add('loggedIn');
  } else {
    target.classList.remove('loggedIn');
  }
};

// Set the session appToken in the app.config object as well as localstorage
app.setSessionToken = function(appToken){
  try {
    var appTokenString = JSON.stringify(appToken);
    localStorage.setItem('appToken', appTokenString);
    app.config.sessionToken = appToken;
    if (typeof(appToken) == 'object') {
      app.setLoggedInClass(true);
    } else {
      app.setLoggedInClass(false);
    }
  } catch (e) {
    console.log(e);
  }
};

// Renew the appToken
app.renewToken = function(callback){
  var currentToken = typeof(app.config.sessionToken) == 'object' ? app.config.sessionToken : false;
  if(currentToken){
    // Update the appToken with a new expiration
    var payload = {
      'expires' : Date.now() + 1000 * 60 * 24
    };
    var queryStringObject = {'id' : currentToken.id};
    app.client.request(undefined,'api/tokens','PUT',queryStringObject,payload,function(statusCode,responsePayload){
      // Display an error on the form if needed
      if(statusCode == 200){
        // Get the new appToken details
        app.setSessionToken(responsePayload.data);
        callback(false);
      } else {
        app.setSessionToken(false);
        callback(true);
      }
    });
  } else {
    app.setSessionToken(false);
    callback(true);
  }
};

// Load data on the page
app.loadDataOnPage = function(){
  // Get the current page from the body class
  var bodyClasses = document.querySelector("body").classList;
  var primaryClass = typeof(bodyClasses[0]) == 'string' ? bodyClasses[0] : false;

  // Logic for account settings page
  if(primaryClass == 'account-edit'){
    app.loadAccountEditPage();
  }

  // Logic for dashboard page
  if(primaryClass == 'items-available'){
    app.loadItemsAvailablePage();
  }

  // Logic for check details page
  if(primaryClass == 'orders'){
    app.loadOrdersPage();
  }
};

// Load the account edit page specifically
app.loadAccountEditPage = function(){
  // Get the email number from the current appToken, or log the user out if none is there
  var email = typeof(app.config.sessionToken.userEmail) == 'string' ? app.config.sessionToken.userEmail : false;
  if(email){
    // Fetch the user data
    var queryStringObject = {
      'email' : email
    };
    app.client.request(undefined,'api/users','GET',queryStringObject,undefined,function(statusCode,responsePayload){
      if(statusCode == 200){
        // Put the data into the forms as values where needed
        document.querySelector("#accountEdit1 .nameInput").value = responsePayload.data.name || '';
        document.querySelector("#accountEdit1 .addressInput").value = responsePayload.data.address || '';
        document.querySelector("#accountEdit1 .displayEmailInput").value = responsePayload.data.email;

        // Put the hidden email field into both forms
        var hiddenEmailInputs = document.querySelectorAll("input.hiddenEmailInput");
        for(var i = 0; i < hiddenEmailInputs.length; i++){
          hiddenEmailInputs[i].value = responsePayload.data.email;
        }

      } else {
        // If the request comes back as something other than 200, log the user our (on the assumption that the api is temporarily down or the users appToken is bad)
        app.logUserOut();
      }
    });
  } else {
    app.logUserOut();
  }
};

// bind items to order
app.bindItemClicks = function() {
  // get all items with class "card"
  const allItems = document.getElementsByClassName("card");
  for (let i = 0; i < allItems.length; i++) {
    const itemId = allItems[i].id;
    // for each item, we add a click listener
    document.getElementById(itemId).addEventListener('click', function() {
        // call the API to add the item into our cart
      app.client.request(undefined,'api/cart','POST',{},{itemId},function(statusCode,responsePayload) {
        // get the element where we gonna show the amount of items on cart
        const shoppingCart = document.getElementsByClassName("cart-item-count")[0];
        // if the amount of items on cart is greater than 0, we remove the class inactive, so we can show the badge with the number on it
        if (shoppingCart.getAttribute('data-count') >= 0){
          shoppingCart.classList.remove('inactive');
        }
        // increment the badge number
        shoppingCart.setAttribute('data-count', parseInt(shoppingCart.getAttribute('data-count')) + 1);
        // if the itemId was already on the cart, we only have to increment the quantity of that item and increase the order price
        // else, we call the template with the items on the user's cart, so we render all the cart items
        if (!document.querySelector('#cart-item-'+itemId)){
            const cartList = document.getElementsByClassName('cart-list')[0];
            app.client.request(undefined,'cart/items','GET',{items: responsePayload.data.cartItems},undefined,function(statusCode,responsePayload,a) {
                cartList.innerHTML = responsePayload.data.str;
                // with every item on cart, we attack a remove listener to remove it from the cart
                app.bindRemoveItem();
                // bind the button to make the order
                app.bindPlaceOrderButton();
            });
        } else {
            // we increment the quantity of that item and increase the order price
            const qty = parseInt(document.querySelector('#cart-item-'+itemId+' .item-qty').innerHTML);
            document.querySelector('#cart-item-'+itemId+' .item-qty').innerHTML = qty + 1;
            const itemPrice = parseFloat(document.querySelector('#cart-item-'+itemId).getAttribute('data-price'));
            let orderPrice = parseFloat(document.querySelector('#place-order span').innerHTML);
            document.querySelector('#place-order span').innerHTML = orderPrice + itemPrice;
        }
      });
    })
  }
};

// bind cart icon click, to show the items on the cart
app.bindCartClick = function() {

  const shoppingCart = document.getElementsByClassName("cart")[0];
  shoppingCart.addEventListener('click', function() {
      const cartList = document.getElementsByClassName('cart-list')[0];
      if (cartList.classList.contains('active')) {
          cartList.classList.remove('active');
          app.isShoppingCartOpen = false;
      } else {
          app.isShoppingCartOpen = true;
          if (!app.isEventListenerBeenAdded) {
              window.addEventListener('click', function (e) {
                  app.isEventListenerBeenAdded = true;
                  // if we click outside the cart list, we close the cart item window
                  if (!cartList.contains(e.target) && (!shoppingCart.contains(e.target) || !app.isShoppingCartOpen)) {
                      cartList.classList.remove('active');
                      app.isShoppingCartOpen = false;
                  }
              });
          }
          cartList.classList.add('active');
      }
  });
};

app.bindRemoveItem = function() {
  const removeItemButtons = document.getElementsByClassName('remove-cart-item');
  for (let i = 0; i < removeItemButtons.length; i++) {
      const removeItemButton = removeItemButtons[i];
      removeItemButton.addEventListener('click', function(){
        const itemId = removeItemButton.getAttribute('data-item-id');
        app.client.request(undefined,'api/cart','DELETE',{},{itemId},function(statusCode,responsePayload) {
            const itemPrice = parseFloat(document.querySelector('#cart-item-'+itemId).getAttribute('data-price'));
            let orderPrice = parseFloat(document.querySelector('#place-order span').innerHTML);
            orderPrice -= itemPrice;
            document.querySelector('#place-order span').innerHTML = orderPrice;


            const qty = parseInt(document.querySelector('#cart-item-'+itemId+' .item-qty').innerHTML);
            if (qty === 1) {
                document.querySelector('#cart-item-'+itemId).remove();
            } else {
                document.querySelector('#cart-item-'+itemId+' .item-qty').innerHTML = qty - 1;
            }
            const shoppingCart = document.getElementsByClassName("cart-item-count")[0];
            shoppingCart.setAttribute('data-count', parseInt(shoppingCart.getAttribute('data-count')) - 1);
            if (shoppingCart.getAttribute('data-count') === '0') {
                shoppingCart.classList.add('inactive');
                document.getElementsByClassName('cart-list')[0].classList.remove('active');
                app.isShoppingCartOpen = false;
            }

        });
      });

  }
};

app.bindPlaceOrderButton = function() {
  const orderButton = document.getElementById('place-order');
  orderButton.addEventListener('click', function(){
    if (!app.orderBeingProcessed) {
        app.orderBeingProcessed = true;
        app.client.request(undefined, 'api/orders', 'POST', {}, {}, function (statusCode, responsePayload) {
            if (statusCode === 200) {
                document.getElementsByClassName('cart-list')[0].innerHTML = 'Order confirmed';
                document.getElementsByClassName("cart-item-count")[0].setAttribute('data-count', "0");
                document.getElementsByClassName("cart-item-count")[0].classList.add('inactive');
            }
            app.orderBeingProcessed = false;
        });
    }
  })
};

// Load the dashboard page specifically
app.loadItemsAvailablePage = function(){
  app.bindItemClicks();
  app.bindCartClick();

  // Get the email number from the current appToken, or log the user out if none is there
  var email = typeof(app.config.sessionToken.userEmail) == 'string' ? app.config.sessionToken.userEmail : false;
  if(email){
    // Fetch the user data
    var queryStringObject = {
      'email' : email
    };
    app.client.request(undefined,'api/users','GET',queryStringObject,undefined,function(statusCode,responsePayload){
      if(statusCode == 200){

        if (responsePayload.data.cartItems && responsePayload.data.cartItems.length) {
            const shoppingCart = document.getElementsByClassName("cart-item-count")[0];
            shoppingCart.classList.remove('inactive');
            shoppingCart.setAttribute('data-count', responsePayload.data.cartItems.length.toString());
            const cartList = document.getElementsByClassName('cart-list')[0];
            app.client.request(undefined,'cart/items','GET',{items: responsePayload.data.cartItems},undefined,function(statusCode,responsePayload,a) {
                cartList.innerHTML = responsePayload.data.str;
                app.bindRemoveItem();
                app.bindPlaceOrderButton();
            });

        }
      } else {
        // If the request comes back as something other than 200, log the user our (on the assumption that the api is temporarily down or the users appToken is bad)
        app.logUserOut();
      }
    });
  } else {
    app.logUserOut();
  }
};


// Load the checks edit page specifically
app.loadOrdersPage = function(){
    var email = typeof(app.config.sessionToken.userEmail) == 'string' ? app.config.sessionToken.userEmail : false;
    if(email) {
        // Fetch the user data
        var queryStringObject = {
            'email': email
        };
        app.client.request(undefined, 'api/users', 'GET', queryStringObject, undefined, function (statusCode, responsePayload) {
            if (statusCode === 200) {
                app.client.request(undefined,'order/items','GET',{orders: responsePayload.data.orders.join(',')},undefined,function(statusCode,responsePayload) {
                    const orderList = document.getElementsByClassName('order-list')[0];
                    orderList.innerHTML = responsePayload.data.str;
                });
            } else {
                // If the request comes back as something other than 200, redirect back to dashboard
                window.location = '/items/available';
            }
        });
    } else {
      app.logUserOut();
    }

};

// Loop to renew appToken often
app.appTokenRenewalLoop = function(){
  setInterval(function(){
    app.renewToken(function(err){
      if(!err){
        console.log("Token renewed successfully @ "+Date.now());
      }
    });
  }, 1000 * 60 * 2);
};

// Init (bootstrapping)
app.init = function(){

  // Bind all form submissions
  app.bindForms();

  // Bind logout logout button
  app.bindLogoutButton();

  // Get the appToken from localstorage
  app.getSessionToken();

  // Renew appToken
  app.appTokenRenewalLoop();

  // Load data on page
  app.loadDataOnPage();

  app.isShoppingCartOpen = false;
  app.isEventListenerBeenAdded = false;
  app.orderBeingProcessed = false;

};

// Call the init processes after the window loads
window.onload = function(){
  app.init();
};
