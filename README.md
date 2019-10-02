# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly). It was created as a part of the Lighthouse Labs Web Development Boot Camp. 

## Final Product

Screenshot of My URLs Page - only shown when the user is logged in:
![My URLs Page](/docs/urls-page.png)

Screenshot of Access Denied Page - shown when there is either no user logged in or the user who is logged in does not have access to that page (ie. users can only view their own URLs):
![Access Denied Page](/docs/register-page.png)

Screenshot of Registration Page:
![Registration Page](/docs/register-page.png)

Screenshot of ShortURL Page - also shows an example of what the app looks like on mobile:
![ShortURL Page](/docs/short-url-page.png)

## Dependencies

- Node.js
- Express
- EJS
- bcrypt
- body-parser
- cookie-session

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.