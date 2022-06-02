import { WorkerExample } from './WorkerExample';
import { Configuration } from '@david.uhlir/config'
import { JsonValidatorType } from '../../dist/utils/JsonValidator'; // TODO get this package from some common
import * as path from 'path';

(async function() {
    const config = await Configuration.load({
        test: {
            type: JsonValidatorType.String
        }
    }, [path.resolve('./config/config.yml')]);

    console.log('config', config.data)
})()
