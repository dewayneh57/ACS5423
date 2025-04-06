# ACS5423 - Dewayne Hafenstein HAFE0010

This repository is used in the development of the project for ACS5423 Software Development for Web.  This 
project uses Node.js and HTML 5 content to demonstrate a web application using the MERN or MEAN stacks.

## Structure
The project is divided into server-side and client-side components. These components are separated into 
different directories. 

### Server-Side 
- / The project root directory contains the .env file, package.json, server.js (main entry 
   point), as well as this read me file. 
- /models Contains the database schema definitions used to access the Mongo database. 
- /modules Contains common service modules used by the server.
- /routes Defines the various API functions and routes.
- /public Exposes all public resources that are downloaded to the client-side and used by the browser, 
  This includes CSS, images, and javascript files. 

### Client-Side 
. /views This directory contains the "views", or the html pages, that are rendered on the browser. 

## CI/CD 
The CI/CD pipelines used in the project are implemented using GitHub actions. There are two pipelines 
defined.  These are: 

1. CI.yml This is the Continuous Integration pipeline and performs a build and test of the code any 
time a change is pushed on any branch. 

2. CD.yml This is the continuous deployment pipeline and is executed only on a successful merge of a 
branch to the "main" branch.  All deployments are performed from "main". 
