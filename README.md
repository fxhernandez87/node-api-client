# Delivery API

## Paths

* [Users](#users)
* [Tokens](#tokens)
* [Items](#items)
* [Cart](#cart)
* [Orders](#orders)

### Users
#### Methods
- **[<code>GET</code> ](#userget)** /users
- **[<code>POST</code> ](#userpost)** /users
- **[<code>PUT</code> ](#userput)** /users
- **[<code>DELETE</code> ](#userdelete)** /users

#### User/GET      
##### Path:
    /users
##### Parameters:
    email* (Required)
##### Headers:
    tokenid* (Required)
##### Response
    {   
        statusCode: 200,
        message: 'User fecthed Correctly',
        data: {
            email,
            address,
            name,
            cartItems, // may not be present
            lastItemAddedAt, // may not be present
            orders // may not be present
        }
    }
##### Errors
    400: Required fields missing or they were invalid
    403: Unauthorized access
    404: User not Found
    500: Insufficient Permissions

#### User/POST      
##### Path:
    /users
##### Parameters:
    email* (Required)
    password* (Required)
    name* (Required)
    address* (Required)
##### Headers:
    none
##### Response
    {   
        statusCode: 200,
        message: 'User created',
        data: {
            email,
            address,
            name
        }
    }
##### Errors
    400: User already exists
    400: Required fields missing or they were invalid    
    500: Insufficient Permissions
    
#### User/PUT      
##### Path:
    /users?email=example@mail.com
##### Parameters:    
    password
    name
    address
##### Headers:
    tokenid* (Required)
##### Response
    {   
        statusCode: 200,
        message: 'User updated correctly',
        data: {
            email,
            address,
            name
        }
    }
##### Errors
    400: User already exists
    400: Nothing to update
    400: Email in query is required
    403: Unauthorized access
    404: User not found    
    421: Email cannot be updated
    500: Insufficient Permissions    
    
#### User/DELETE      
##### Path:
    /users?email=example@mail.com
##### Parameters:
    none    
##### Headers:
    tokenid* (Required)
##### Response
    {   
        statusCode: 200,
        message: 'user removed correctly',
        data: {}
    }
##### Errors
    400: Required fields missing or they were invalid
    403: Unauthorized access
    404: User not found    
    500: Insufficient Permissions

### Tokens
#### Methods
- **[<code>GET</code> ](#tokenget)** /tokens
- **[<code>POST</code> ](#tokenpost)** /tokens
- **[<code>PUT</code> ](#tokenput)** /tokens
- **[<code>DELETE</code> ](#tokendelete)** /tokens

#### Token/GET      
##### Path:
    /tokens?id=string
##### Parameters:
    id* (Required)
##### Headers:
    none
##### Response
    {   
        statusCode: 200,
        message: 'Token fecthed Correctly',
        data: {
            id,
            userEmail,
            expires
        }
    }
##### Errors
    400: Required fields missing or they were invalid
    403: Unauthorized access
    404: Token not Found
    500: Insufficient Permissions

#### Token/POST      
##### Path:
    /tokens
##### Parameters:
    email* (Required)
    password* (Required)
##### Headers:
    none
##### Response
    {   
        statusCode: 200,
        message: 'user logged in',
        data: {
            id,
            userEmail,
            expires
        }
    }
##### Errors
    400: Required fields missing or they were invalid
    400: wrong email or password
    400: Token already exists
    404: User does not exists    
    500: Insufficient Permissions
    
#### Token/PUT      
##### Path:
    /tokens?id=string
##### Parameters:    
    expires
##### Headers:
    none
##### Response
    {   
        statusCode: 200,
        message: 'Token updated correctly',
        data: {
            id,
            userEmail,
            expires
        }
    }
##### Errors
    400: Nothing to update
    400: id in query is required
    403: Unauthorized access
    404: Token not found    
    421: id cannot be updated
    500: Insufficient Permissions    
    
#### Token/DELETE      
##### Path:
    /tokens?id=string
##### Parameters:
    none    
##### Headers:
    none
##### Response
    {   
        statusCode: 200,
        message: 'token removed correctly',
        data: {}
    }
##### Errors
    400: Required fields missing or they were invalid
    403: Unauthorized access
    404: Token not found    
    500: Insufficient Permissions

### Items
#### Methods
- **[<code>GET</code> ](#itemget)** /items
- **[<code>POST</code> ](#itempost)** /items
- **[<code>PUT</code> ](#itemput)** /items
- **[<code>DELETE</code> ](#itemdelete)** /items

#### Item/GET      
##### Path:
    /items?id=string
##### Parameters:
    id (optional) // if id is not present, will return the list of items in storage
##### Headers:
    none
##### Response
    {   
        statusCode: 200,
        message: 'Item fecthed Correctly',
        data: {
            id,
            price,
            name
        }
    }
##### Errors
    400: Required fields missing or they were invalid
    403: Unauthorized access
    404: Item not Found
    500: Insufficient Permissions

#### Item/POST      
##### Path:
    /items
##### Parameters:
    name* (Required)
    price* (Required)
##### Headers:
    none
##### Response
    {   
        statusCode: 200,
        message: 'Item created',
        data: {
            id,
            price,
            name
        }
    }
##### Errors
    400: Required fields missing or they were invalid    
    500: Insufficient Permissions
    
#### Item/PUT      
##### Path:
    /items?id=string
##### Parameters:    
    name* required
    price* required
##### Headers:
    none
##### Response
    {   
        statusCode: 200,
        message: 'Item updated correctly',
        data: {
            email,
            address,
            name
        }
    }
##### Errors
    400: Item already exists
    400: Nothing to update
    400: id in query is required
    403: Unauthorized access
    404: Item not found    
    421: id cannot be updated
    500: Insufficient Permissions    
    
#### Item/DELETE
    Will remove the item and update all users cartItems that had this item and remove it      
##### Path:
    /items?id=string
##### Parameters:
    none    
##### Headers:
    none
##### Response
    {   
        statusCode: 200,
        message: 'item removed correctly',
        data: {}
    }
##### Errors
    400: Required fields missing or they were invalid
    403: Unauthorized access
    404: Item not found    
    500: Insufficient Permissions
    
### Cart
#### Methods
- **[<code>GET</code> ](#cartget)** /cart
- **[<code>POST</code> ](#cartpost)** /cart
- **[<code>DELETE</code> ](#cartdelete)** /cart

#### Cart/GET      
##### Path:
    /cart
##### Parameters:
    none    
##### Headers:
    tokenid* Required
##### Response
    {   
        statusCode: 200,
        message: 'Cart fecthed Correctly',
        data: {
            id,
            price,
            name
        }
    }
##### Errors
    403: Unauthorized access
    404: items not Found
    500: Insufficient Permissions

#### Cart/POST      
##### Path:
    /cart
##### Parameters:
    itemId* (Required)
##### Headers:
    tokenid* Required
##### Response
    {   
        statusCode: 200,
        message: 'item added to cart',
        data: {
            email,
            address,
            name,
            cartItems,
            lastItemAddedAt,
            orders // may not be present
        }
    }
##### Errors
    400: Required fields missing or they were invalid    
    500: Insufficient Permissions
    
#### Cart/DELETE
##### Path:
    /cart
##### Parameters:
    itemId* (Required)
##### Headers:
    tokenid* Required
##### Response
    {   
        statusCode: 200,
        message: 'item removed from cart',
        data: {
            email,
            address,
            name,
            cartItems,
            lastItemAddedAt,
            orders // may not be present
        }
    }
##### Errors
    400: Required fields missing or they were invalid
    403: Unauthorized access
    404: item not found on cart    
    404: User not found    
    500: Insufficient Permissions

    
### Orders
#### Methods
- **[<code>GET</code> ](#orderget)** /orders
- **[<code>POST</code> ](#orderpost)** /orders

#### Order/GET      
##### Path:
    /orders
##### Parameters:
    id* Required    
##### Headers:
    tokenid* Required
##### Response
    {   
        statusCode: 200,
        message: 'Order fecthed Correctly',
        data: {
            id,
            items,
            iat,
            price,
            paymentProcessed
        }
    }
##### Errors
    400: Required fields missing or they were invalid
    403: Unauthorized access
    404: Order not found
    500: Insufficient Permissions

#### Order/POST    
    Will create the order with the items on the cart  
##### Path:
    /orders
##### Parameters:
    none
##### Headers:
    tokenid* Required
##### Response
    {   
        statusCode: 200,
        message: 'order created',
        data: {
            id,
            items,
            iat,
            price,
            paymentProcessed
        }
    }
##### Errors
    400: payment not processed   
    400: no items on cart to place an order
    400: Order already exists
    400: Required fields missing or they were invalid    
    500: Insufficient Permissions
