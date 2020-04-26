tile-tool
===

Pet project for helping me manage a tile38 server from the command line.

To get started
===
You will need to set the following environment variables:
* TILE38_HOST - hostname where your tile38 server is running
* TILE38_AUTH - your password, if defined.

Or you can just create a file called .env in the same directory and define them there as:
```
TILE38_HOST=yourhost
TILE38_AUTH=yourpassword
```

I wanted my command as short as possible, so I specified "tt" as the "bin" value in package.json.  
You might like a different name.  If so, then change it there before continuing.

run: 
```npm link``` to create a link in ```/usr/local/bin```

then just run:
```tt --help```
to see the available commands and options.
```
Usage: tile-tool [options]

Options:
  -i, --id <id>          For actions that require an ID.
  -k, --key <key>        For actions that require a key.
  -r, --radius <radius>  For actions that require a radius.
  --no-coordinates       Specifies that results should not contain coordinates (names only).
  --search               Search for objects in a given key.
  -n, --nearby <coords>  Find objects which are nearby <coords>
  -s, --scan             Gets all objects matching a given key value.  For all objects, specify 'all' for --key.
  --stats                Get details for a given key.
  --setpoint <coords>    Adds a position value for a given key and id with the provided <coords>
  -d --delete            Delete a key or id (Use with caution!!!)
  -h, --help             display help for command

```

Thanks
===
Thanks to the efforts of [Josh Baker](https://github.com/tidwall) who created the amazing [Tile38](https://tile38.com/) Geospatial Database & Geofencing Server and to [Peter Hulst](https://github.com/phulst) who created the [node-tile38](https://github.com/phulst/node-tile38) package.