# Delivery API

## Paths

* [Users](#users)
* [Tokens](#tokens)
* [Items](#items)
* [Cart](#cart)
* [Orders](#orders)

### Users
#### Methods
- **[<code>GET</code> ](get)** /users
- **[<code>POST</code> ](post)** /users
- **[<code>UPDATE</code> ](update)** /users
- **[<code>DELETE</code> ](delete)** /users
    ##### Parameters:
        email* (Required)
    ##### Headers:
        tokenid* (Required
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

- **[<code>POST</code> ](post)** /users
    ##### Parameters:
        email* (Required)
    ##### Headers:
        tokenid* (Required
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
    

