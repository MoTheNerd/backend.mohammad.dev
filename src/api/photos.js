import resource from 'resource-router-middleware';
import { ObjectID } from 'mongodb'

export default ({ db, space }) => resource({

    /** Property name to store preloaded entity on `request`. */
    id: 'photo',

	/** For requests with an `id`, you can auto-load the entity.
	 *  Errors terminate the request, success sets `req[id] = data`.
	 */
    async load(req, id, callback) {
        let photo = await db.collection('photos').findOne({ '_id': new ObjectID(id) })
        let err = photo ? null : 'Not found';

        callback(err, photo);
    },
    /** PUT /:id - Update a given entity */
    // async update(req, res) {
        
    // },

    /** GET / - List all entities */
    async index({ params }, res) {
        res.json(await db.collection('photos').find().toArray());
    },

    /** POST / - Create a new entity */
    async create(req, res) {
        space.uploadPhoto(db, req, res, function (err) {
            if (err) { console.log(err); return res.json("Error: Something went wrong") }
            res.json("Success: File uploaded successfully!");
        })
    },

    /** DELETE /:id - Delete a given entity */
    // delete({ photo }, res) {
    //     // photos.splice(photos.indexOf(photo), 1);
    //     res.sendStatus(204);
    // }
});