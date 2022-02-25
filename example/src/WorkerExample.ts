import { Worker, AsObject } from '@david.uhlir/cluster';

export interface Params {}

/**
 * Fork process instance
 *
 * This class will represents worker in cluster.
 */
export class WorkerExampleFork {
    constructor(
        public readonly params: Params,
        public readonly master: AsObject<WorkerExample>,
    ) {

    }

}

/**
 * Master process instance
 *
 * This class will represents handler of fork in master process.
 */
export class WorkerExample extends Worker<Params, WorkerExampleFork> {
    constructor(params: Params = {}) {
        super(params);
    }

    // initialize my fork, return receiver object for RPC
    protected async initWorker(params: Params, master: any) {
        return new WorkerExampleFork(params, master);
    }
}
