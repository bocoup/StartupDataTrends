#Startup Data Trends

This repo contains the code that was written to build http://startupdatatrends.com, a visual browser of startup data from AngelList (http://angel.com.)

The repo was built on top of Backbone-boilerplate by @tbranyen (https://github.com/tbranyen/backbone-boilerplate)

See the Bocoup blog for more information about the application (http://weblog.bocoup.com)

If you have any questions or comments, contact @iros here or: irene at bocoup dot com.

Setting up dev environment
--------------------------

Run `npm install` from your application root.

**In the case that `npm install` fails on `stats` module.  Use `npm install -f` instead.  This command will force "incompatible" modules to still install.**

Build
-----

The application is built using jake. You can start the build from the `build` folder. Just call `jake` on the command line. 

Server
------

Run with `node dev`

The development server runs on a privileged port `80` which needs superuser privileges to run correctly.  The easiest work-around is to run the development
server under a `sudo` (elevated) user.  The command may look something like this:

``` bash
sudo node dev
```

Alternatively you may investigate running the server using something similar to [authbind](http://en.wikipedia.org/wiki/Authbind)
