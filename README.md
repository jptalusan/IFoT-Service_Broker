# IFoT-Service_Broker
Service broker, to be used in conjunction with IFoT-middleware:distributed/wip
here: https://github.com/linusmotu/IFoT-middleware

Right now the master1_url is hardcoded in different places:
nuts.html
config.py (which i think is ok?)
others???

Should be changeable via UI which is what this is.
This is really just a frontend made from flask that communicates with the master node's API.
