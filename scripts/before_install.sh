#!/bin/bash

#download node and npm
# curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh | bash
# . ~/.nvm/nvm.sh
# nvm install node

#create our working directory if it doesnt exist
DIR="/home/ec2-user/feather-app"
if [ -d "$DIR" ]; then
  echo "${DIR} exists and deleting"
  rm -r ${DIR}
  echo "Creating ${DIR} directory"
  mkdir ${DIR}
else
  echo "Creating ${DIR} directory"
  mkdir ${DIR}
fi
