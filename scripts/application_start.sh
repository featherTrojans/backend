#!/bin/bash
sudo chmod -R 777 /home/ec2-user/feather-app

#navigate to folder
cd /home/ec2-user/feather-app

# add npm and node to path
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion" # loads nvm bash_completion

# install node modules
npm install

#start server and run app in background
node server.js > app.out.log 2> app.err.log < /dev/null &
