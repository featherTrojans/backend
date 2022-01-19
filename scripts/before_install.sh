#!/bin/bash
source /home/ec2-user/.bash_profile
#download node and npm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh | bash . ~/ .nvm/nvm.sh

nvm install node

#create working directory
DIR="home/ec2-user/feather-app"
if [ -d "$DIR" ]; then
    echo "{$DIR} exists"
else
    echo "Creating {$DIR} directory"
    mkdir {$DIR}
fi