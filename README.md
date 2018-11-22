This is a very basic voting website with no user accounts made in a hackathon.

# Installation

`npm install`

# Start server on localhost:3000

`npm start`

The goal was to create a quick voting website that could be used in comittee meetings and similar scenarios. We chose to not implement user accounts to reduce time needed to create apoll, and to remove certain types of security problems entirely. The poll itself is given a password which is required to edit it. Voting is completely unauthenticated.

Some similar (actually usable) tools include Strawpoll and Google Forms. RCV is neigh on impossible to use on either, despite being very useful for deciding between a few different options.

[Index page](screenshots/index.png?raw=true)

[Creating a poll](screenshots/create.png?raw=true)

[Voting on a poll](screenshots/vote.png?raw=true)

[Viewing results of a poll](screenshots/results.png?raw=true)

We planned to have multiple types of voting systems and multi question polls but did not have time. Approval voting is implemented (incorrectly named as agreement on the app), with unfinished support for RCV.

# Technical

On the backend this is a Node.js application using Express.js and MongoDB performing CRUD operations. This was significantly helped by [this template](https://github.com/kacole2/express-node-mongo-skeleton) however the coding styles between that template and later code here clash in places (`"` vs `'` for comments and `;` or no `;`). Because we opted to not implement user accounts there is 1 model (`model/votes.js`), a view for that 1 model (`views/votes`) (and the index page), and 1 controller for that model (`routes/votes.js`). Consequentely this makes an extremely minimal template for a Node.js server that might make a useful reference to someone.

