#!/bin/bash
#Stopping existing

echo "Stopping existing node servers"
pkill -SIGINT -f server.js