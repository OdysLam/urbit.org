+++
title = "Overview"
weight = 1
template = "doc.html"
+++

Jael is the networking key infrastructure vane.

The main purpose of Jael is keeping track of [Azimuth](/docs/azimuth/azimuth) related information. For each ship, this consists of its public keys, its key revision number (or `life`), its continuity breach number (or `rift`) (see [Life and Rift](/docs/azimuth/life-and-rift)), and who the sponsor of the ship is. It also handles the local ship's private keys, keeps track of galaxy domain prefixes, and performs some boot-related tasks.

By default, Jael's primary source of information is the Gall agent `%azimuth-tracker`, which (using `%eth-watcher`) runs a thread that polls an Ethereum node for transactions in the Azimuth contract. It can also get updates from other ships on the network. This is always the case for moons, where it subscribes to the moon's parent's Jael for updates.

The database of PKI information that Jael maintains is used by other vanes and agents for identity validation, encryption, decryption, and other cryptographic functions. In particular, Ames (the network vane) uses the information stored in Jael to encrypt packets it sends to other ships, and to decrypt & validate packets it receives from other ships.

Jael has a few `task`s you can use to interact with it. In particular, its [%public-keys task](/docs/arvo/jael/tasks#public-keys) allows an agent or thread to subscribe for PKI updates for a `set` of `ship`s.

## Sections

[API Reference](/docs/arvo/jael/tasks) - The `task`s Jael takes and the `gift`s it returns.

[Scry Reference](/docs/arvo/jael/scry) - The scry endpoints of Jael.

[Data Types](/docs/arvo/jael/data-types) - Reference documentation of the various data types used by Jael.

[Examples](/docs/arvo/jael/examples) - Practical examples of using Jael's `task`s.
