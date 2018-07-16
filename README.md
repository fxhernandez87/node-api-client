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
            name
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



