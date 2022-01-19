#!/bin/bash
source /home/ec2-user/.bash_profile
#Stopping existing
cd /home/ec2-user/feather-app
echo "Stopping existing node servers"
pkill node