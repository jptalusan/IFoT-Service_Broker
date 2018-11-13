# IFoT-Service_Broker
Setup:  
1. Setup a docker cluster on some nodes.  
2. Take note of the IP address of the master node in the cluster.  
3. Modify hard coded IP addresses for the master node in the following files:  
    - s_broker/project/client/static/main.js  
        - master node ip is needed.  
    - s_broker/project/server/config.py  
        - REDIS_URL = is the ip address of which node the REDIS DB service is on.  
        - MASTER1 = ip address of the master node of the docker cluster  
    - s_broker/project/server/main/views.py  
        - lines 161-166 need to modified depending on the ip address of the master node.  
4. cd ~/service_broker  
5. Build the docker image: docker-compose up --build  
6. Access the service broker via HTTP GET and you should be shown the available services.  

Right now service broker communicates with the master node via RESTFUL API and the user via the web interface.  
Aside from a few hardcoded lines, this should be easy to setup.  
Will work on making this easier to deploy.  

Service broker, to be used in conjunction with IFoT-middleware:distributed/wip
here: https://github.com/linusmotu/IFoT-middleware

Right now the master1_url is hardcoded in different places:
nuts.html
config.py (which i think is ok?)
others???

Should be changeable via UI which is what this is.
This is really just a frontend made from flask that communicates with the master node's API.
