#!/bin/bash
sudo chmod -R 777 /home/ec2-user/feather-app

#navigate to folder
cd /home/ec2-user/feather-app

# add npm and node to path
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion" # loads nvm bash_completion
ENV_VAR=".env"
ENV_EX=".env.example"

if [ -d "$ENV_VAR" ]; then
    echo "$ENV_VAR exists"
else
    echo "Creating $ENV_VAR directory"
    cp "$ENV_EX" "$ENV_VAR"
fi
# install node modules
npm install

#start server and run app in background
node server.js > app.out.log 2> app.err.log < /dev/null &
