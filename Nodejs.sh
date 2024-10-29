#!/bin/bash

# Update the system using yum
# sudo yum -y update

sudo groupadd -f csye6225
 
# Create user csye6225 and add to group csye6225
sudo useradd -r -s /usr/sbin/nologin -g csye6225 csye6225
 
sudo chown -R csye6225:csye6225 /opt
 
sudo cp /tmp/csye6225.service /lib/systemd/system/csye6225.service

# Add Node.js LTS repository
curl -fsSL https://rpm.nodesource.com/setup_lts.x | sudo bash -

sudo dnf install -y unzip
 
sudo dnf install httpd -y

# Install Node.js
sudo yum install -y nodejs

#Appsetup
sudo chmod -R 755 /opt
sudo cp /tmp/webapp.zip /opt/
cd /opt || exit
sudo unzip webapp.zip -d /opt/webapp
#sudo cp /tmp/.env /opt/webapp
sudo chown -R csye6225:csye6225 /opt/webapp
cd /opt/webapp || exit


# Install Node.js and npm
sudo npm install

sudo systemctl daemon-reload
sudo systemctl enable httpd
sudo systemctl start httpd
sudo systemctl enable csye6225
sudo systemctl start csye6225
sudo systemctl status csye6225
journalctl -xe
