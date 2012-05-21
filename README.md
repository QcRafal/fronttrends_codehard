# Install node modules
npm install

# Start mongod
mkdir ./db
mongod --dbpath ./db/

# Run node
node app

