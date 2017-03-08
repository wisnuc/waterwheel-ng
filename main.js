import config from 'config-lite'

import app from './src/app'
import pkg from './package'

app.listen(config.port, () => console.log(`${pkg.name} listening on port ${config.port}`))