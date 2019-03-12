import aws from 'aws-sdk'
import multer from 'multer'
import multerS3 from 'multer-s3'
import { ObjectID } from 'mongodb'

export default async callback => {
	let space = initializeSpace()
	let db = await initializeDatabase(callback, space)
	callback({ db, space })
}

const initializeDatabase = async () => {
	var MongoClient = require('mongodb').MongoClient
	let client = await MongoClient.connect(`mongodb://${process.env.DB_SERVER}/27017`, { useNewUrlParser: true })
	var db = await client.db(process.env.ENVIR === 'prod' ? "prod" : "dev");
	db.collection('general').find().toArray((err, result) => {
		console.log(result)
	});
	return db;
}

const initializeSpace = () => {
	aws.config.update({
		secretAccessKey: process.env.SPACE_SECRET_ACCESS_KEY,
		accessKeyId: process.env.SPACE_ACCESS_KEY,
	})
	const spacesEndpoint = new aws.Endpoint('sfo2.digitaloceanspaces.com')
	const s3 = new aws.S3({
		endpoint: spacesEndpoint
	});
	const uploadPhoto = (db, req, res, next) => {
		multer({
			storage: multerS3({
				s3: s3,
				bucket: 'moserver',
				acl: 'public-read',
				key: async function (request, file, callback) {
					let inserted = await db.collection('photos').insertOne({ name: req.params })
					await db.collection('photos').updateOne({ "_id": new ObjectID(inserted.insertedId) }, { $set: { "path": `https://moserver.sfo2/digitaloceanspaces.com/photos/${inserted.insertedId}` } })
					console.log(inserted.insertedId)
					console.log(file);
					callback(null, `photos/${inserted.insertedId.toString()}.${file.mimetype === "image/jpeg" ? "jpg" : "png"}`);
				}
			})
		}).array('upload', 1)(req, res, next);
	}
	return { uploadPhoto }
}