import { Configuration } from './configuration/Configuration'
import { JsonValidatorType } from './utils/JsonValidator'

const test = new Configuration({
    test: {
        type: JsonValidatorType.String
    }
})


const jj = test.data

