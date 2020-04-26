#!/usr/bin/env node
require('dotenv').config();
const Tile38 = require('tile38');
const program = require('commander');
const Table = require('cli-table3');

if (process.argv.length == 2) {
    console.log(`Try ${process.argv[1]} --help.`);
    process.exit();
};

program
    .name("tile-tool")
    // options start here
    .option("-i, --id <id>", "For actions that require an ID.")
    .option("-k, --key <key>", "For actions that require a key.")
    .option("-r, --radius <radius>", "For actions that require a radius.")
    .option("--no-coordinates", "Specifies that results should not contain coordinates (names only).")
    // commands start here
    .option("--search", "Search for objects in a given key.")
    .option("-n, --nearby <coords>", "Find objects which are nearby <coords>")
    .option("-s, --scan", "Gets all objects matching a given key value.  For all objects, specify 'all' for --key.")
    .option("--stats", "Get details for a given key.")
    .option("--setpoint <coords>", "Adds a position value for a given key and id with the provided <coords>")
    .option("-d --delete", "Delete a key or id (Use with caution!!!)")
    .parse(process.argv);

const client = new Tile38({
    host:process.env.TILE38_HOST,
    password:process.env.TILE38_AUTH
});

const getKeys = async (client, searchTerm) => {
    const results = await client.sendCommand('keys', null, searchTerm);
    client.quit();
    const parsed = JSON.parse(results);
    parsed.keys.forEach(k => console.log(k));
}

const deleteItem = async (client, key, id) => {
    let result;
    if (id) {
        result = await client.del(key, id);
    } else {
        result = await client.drop(key);
    }
    client.quit();
    console.log(result);
}

const getStats = async (client, searchTerm) => {
    const results = await client.sendCommand('stats', null, searchTerm);
    client.quit();
    const parsed = JSON.parse(results);
    if (parsed.stats[0] == null) {
        console.log(`No objects found for term ${searchTerm}.`);
        return;
    }
    const table = new Table({
        head: ['Memory Used', 'Object Count', 'Point Count', 'String Count']
    });
    const stats = parsed.stats[0];
    table.push([stats.in_memory_size, stats.num_objects, stats.num_points, stats.num_strings]);
    console.log(table.toString());
}

const scanKey = async (client, key, coordinates) => {
    const results = await client.sendCommand('scan', null, key);
    client.quit();
    const parsed = JSON.parse(results);
    if (parsed.objects.length === 0) {
        console.log(`Nothing found for key ${key}.`)
        process.exit(0);
    }

    dumpObjects(parsed.objects, coordinates);
}

const setPoint = async (client, key, id, coords) => {
    let args = [];
    try {
        args = getCoordsArray(coords);
    } catch (err) {
        console.log(err);
        process.exit();
    }

    const result = await client.set(key, id, args);
    client.quit();
    console.log(result);
}

const nearBy = async (client, key, coords, radius, coordinates) => {
    let args = [key, 'point'];
    try {
        const c = getCoordsArray(coords);
        args.push(c[0]);
        args.push(c[1]);
    } catch (err) {
        console.log(err);
        process.exit();
    }
    if (radius) {
        args.push(radius);
    }

    const result = await client.sendCommand('NEARBY', null, args);
    client.quit();
    const parsed = JSON.parse(result);
    if (parsed.objects.length === 0) {
        console.log("No items found.");
        process.exit(0);
    }
    dumpObjects(parsed.objects, coordinates);
}

const dumpObjects = (objects, showCoords) => {
    objects.forEach(o => {
        console.log(`${o.id}${ showCoords ? collapseCoords(o.object.coordinates) : ''}`)
    })
}

const collapseCoords = (coords) => {
    return ` ${coords[0]} ${coords[1]}`;
}

const getCoordsArray = (coords) => {
    let coordArray = [];
    const c = coords.split(',')
    coordArray.push(c[0]);
    coordArray.push(c[1]);
    return coordArray;
}

const ensureRequired = (required) => {
    let valid = true;
    required.forEach(r => {
       if (!program[r]) {
           console.log(`Missing required '${r}' parameter.`);
           valid = false;
       }
    });
    if (!valid) {
        process.exit(1);
    }
}

if (program.scan) {
    ensureRequired(['key']);
    scanKey(client, program.key, program.coordinates);
} else if (program.search) {
    ensureRequired(['key']);
    const searchTerm = program.key === 'all' ? '*' : program.key;
    getKeys(client, searchTerm);
} else if (program.stats) {
    getStats(client, program.key);
} else if (program.delete) {
    ensureRequired(['key']);
    deleteItem(client, program.key, program.id);
} else if (program.setpoint) {
    ensureRequired(['id', 'key']);
    setPoint(client, program.key, program.id, program.setpoint);
} else if (program.nearby) {
    ensureRequired(['key', 'nearby']);
    nearBy(client, program.key, program.nearby, program.radius, program.coordinates);
} else {
    client.quit();
}