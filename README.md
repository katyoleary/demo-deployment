#Installation

git clone this repository down to your local machine.  
run npm i (in your terminal) to install all the dependencies of this application. 

#Server

to start your server, run teh command npm run start in your terminal. make sure you are in the same directory you cloned down.  

#Endpoints

As a user:

POST requests to /api/signup
-to 'sign up', you must enter a valid username and password
-invalid requests will not respond with a token

GET requests to /api/signin
-if you enter a proper username and password, you'll be granted authorization with a token
-if your username or password is invalid, you will recieve a 401: Unauthorized error


In regards to collections:

POST requests to /api/collections
-to add a collection, please provide a valid name and description

GET requests to /api/collections/:collectionId
-to retrieve a collection, please provide the proper collection id

PUT requests to /api/collections/:collectionId
-to edit a collection, provide a proper collection id, new name and description

DELETE requests to /api/collections/:collectionId
-to delete a collection, please provide the collection id

In regards to images:

POST requests to /api/collections/:collectionId/image
-to add an image so s3, provide a valid name, a desc(description), and an image file



