#!/bin/bash

echo '======================'
echo 'Running restart_server'
echo '======================'

npx pm2 restart /home/ubuntu/build/src/app.js —watch