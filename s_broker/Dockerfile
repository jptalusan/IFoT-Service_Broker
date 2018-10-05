#front end dockerfile
FROM resin/raspberry-pi-python:3.6

#ENV INITSYSTEM on
EXPOSE 5001

# set working directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# add requirements (to leverage Docker cache)
ADD ./requirements.txt /usr/src/app/requirements.txt

RUN apt-get -y install libc-dev
RUN apt-get -y install build-essential
RUN pip install -U pip

# install requirements
RUN pip install -r requirements.txt
