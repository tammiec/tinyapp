# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly). It was created as a part of the Lighthouse Labs Web Development Boot Camp. 

## Final Product

Screenshot of Access Denied Page - shown when there is either no user logged in or the user who is logged in does not have access to that page (ie. users can only view their own URLs):
![Access Denied Page](/docs/access-denied-page.png)

Screenshot of the Login Page:
![Login Page](/docs/login-page.png)

Screenshot of My URLs Page - only shown when the user is logged in:
![My URLs Page](/docs/urls-page.png)

Screenshot of ShortURL Page - displays analytics for total number of visitors, number of unique visitors, and a visitor history log containing a unique visitor ID and timestamp:
![ShortURL Page](/docs/short-url-page.png)

Screenshot of ShortURL Page - mobile view:
![Short URL Page - Mobile](/docs/short-url-mobile.png)

Screenshot of Create New URL Page - mobile view:
![Create New Page - Mobile](/docs/new-mobile.png)


## Dependencies

- Node.js
- Express
- EJS
- bcrypt
- body-parser
- cookie-parser
- cookie-session
- method-override

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.