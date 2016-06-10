#re-added this for kicks and giggles
FROM node:4.3

ADD . /oncue/apps/oncue-dashboard

# Install gem sass for  grunt-contrib-sass
#RUN apt-get update -qq && apt-get install -y build-essential

WORKDIR /oncue/apps/oncue-dashboard

# Make everything available for start
#ADD . /oncue/apps/oncue-dashboard
#ADD .bowerrc /oncue/apps/oncue-dashboard/.bowerrc
#ADD bower.json /oncue/apps/oncue-dashboard/bower.json

#dale added this
RUN apt-get update -y
RUN apt-get install node-gyp -y
RUN apt-get install gcc-4.8 g++-4.8 -y
RUN update-alternatives --install /usr/bin/gcc gcc /usr/bin/gcc-4.8 60 --slave /usr/bin/g++ g++ /usr/bin/g++-4.8

## Install Mean.JS Prerequisites
#RUN npm install -g grunt-cli


# Install Mean.JS packages
ADD package.json /oncue/apps/oncue-dashboard/package.json
RUN npm install



# Port 3000 for server
# Port 35729 for livereload
EXPOSE 3000 35729
CMD ["npm", "start"]
