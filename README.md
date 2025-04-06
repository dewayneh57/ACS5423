# ACS5423 - Dewayne Hafenstein HAFE0010

This repository is used in the development of the project for ACS5423 Software Development for Web.  This 
project uses Node.js and HTML 5 content to demonstrate a web application using the MERN or MEAN stacks.

## Structure

## CI/CD 
The CI/CD pipelines used in the project are implemented using GitHub actions. There are two pipelines 
defined.  These are: 

1. CI.yml This is the Continuous Integration pipeline and performs a build and test of the code any 
time a change is pushed on any branch. 

2. CD.yml This is the continuous deployment pipeline and is executed only on a successful merge of a 
branch to the "main" branch.  All deployments are performed from "main". 
