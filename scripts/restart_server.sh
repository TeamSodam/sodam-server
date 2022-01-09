#!/bin/bash

echo '======================'
echo 'Running restart_server'
echo '======================'

cd /home/ubuntu/build
sudo npx pm2 start src/app.js --watch