import { version } from '../../package.json';
import { Router } from 'express';
import photos from './photos';

export default ({ config, db, space }) => {
	let api = Router();

	// mount the facets resource
	api.use('/photos', photos({ config, db, space }));

	// perhaps expose some API metadata at the root
	api.get('/', (req, res) => {
		res.json({ version });
	});

	return api;
}
