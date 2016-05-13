#re-added this for kicks and giggles
FROM node:4.3

ADD . /oncue/apps/oncue-dashboard
ADD .bowerrc /oncue/apps/oncue-dashboard/.bowerrc
ADD bower.json /oncue/apps/oncue-dashboard/bower.json

# Install gem sass for  grunt-contrib-sass
RUN apt-get update -qq && apt-get install -y build-essential
RUN apt-get install -y ruby
RUN gem install sass

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

# Install Mean.JS Prerequisites
RUN npm install -g grunt-cli
RUN npm install -g bower


# Install Mean.JS packages
ADD package.json /oncue/apps/oncue-dashboard/package.json
RUN npm install

# Manually trigger bower. Why doesnt this work via npm install?
#ADD .bowerrc /oncue/apps/oncue-dashboard/.bowerrc
#ADD bower.json /oncue/apps/oncue-dashboard/bower.json
RUN bower install --config.interactive=false --allow-root


# Set development environment as default
ENV NODE_ENV development

# Port 3000 for server
# Port 35729 for livereload
EXPOSE 3000 35729
CMD ["npm", "start"]
